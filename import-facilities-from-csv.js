const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');

// Database configuration for live database
const dbConfig = {
  host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'kwpostgres',
  ssl: {
    rejectUnauthorized: false
  },
  // Add connection timeout and keep-alive settings
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 1 // Use single connection for this script
};

class FacilitiesImporter {
  constructor() {
    this.client = null;
    this.facilitiesMap = new Map(); // Track unique facilities
    this.projectFacilities = []; // Track project-facility relationships
  }

  async connect() {
    try {
      console.log('🔌 Connecting to database...');
      this.client = new Client(dbConfig);
      await this.client.connect();
      console.log('✅ Connected successfully!');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
      console.log('🔌 Database connection closed');
    }
  }

  // Parse facilities string into array of individual facilities
  parseFacilities(facilitiesString) {
    if (!facilitiesString || facilitiesString.trim() === '') {
      return [];
    }

    // Split by newlines and clean up
    const facilities = facilitiesString
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => {
        // Remove numbering like "1.", "2.", etc.
        return item.replace(/^\d+\.\s*/, '').trim();
      })
      .filter(item => item.length > 0); // Filter again after cleaning

    return facilities;
  }

  // Ensure facilities table exists
  async ensureFacilitiesTable() {
    try {
      console.log('\n📋 Checking facilities table...');
      
      const tableExists = await this.client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'facilities'
        );
      `);

      if (!tableExists.rows[0].exists) {
        console.log('🏗️ Creating facilities table...');
        await this.client.query(`
          CREATE TABLE facilities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            category VARCHAR(100),
            icon VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
        console.log('✅ Facilities table created!');
      } else {
        console.log('✅ Facilities table already exists!');
      }
    } catch (error) {
      console.error('❌ Error creating facilities table:', error.message);
      throw error;
    }
  }

  // Ensure project_facilities junction table exists
  async ensureProjectFacilitiesTable() {
    try {
      console.log('\n📋 Checking project_facilities table...');
      
      const tableExists = await this.client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'project_facilities'
        );
      `);

      if (!tableExists.rows[0].exists) {
        console.log('🏗️ Creating project_facilities table...');
        await this.client.query(`
          CREATE TABLE project_facilities (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
            facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(project_id, facility_id)
          );
        `);
        console.log('✅ Project facilities table created!');
      } else {
        console.log('✅ Project facilities table already exists!');
      }
    } catch (error) {
      console.error('❌ Error creating project_facilities table:', error.message);
      throw error;
    }
  }

  // Import facilities from CSV
  async importFacilitiesFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          if (data.facilities && data.facilities.trim() !== '') {
            const projectName = data.projectName || '';
            const facilities = this.parseFacilities(data.facilities);
            
            if (facilities.length > 0) {
              results.push({
                projectName,
                facilities
              });
            }
          }
        })
        .on('end', () => {
          console.log(`📥 Processed ${results.length} projects with facilities from CSV`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('❌ Error reading CSV:', error.message);
          reject(error);
        });
    });
  }

  // Process and import facilities
  async processFacilities(projectFacilitiesData) {
    try {
      console.log('\n🔄 Processing facilities data...');
      
      let totalFacilities = 0;
      let totalRelationships = 0;
      let newFacilities = 0;
      let newRelationships = 0;

      // First pass: collect all unique facilities
      for (const projectData of projectFacilitiesData) {
        for (const facilityName of projectData.facilities) {
          if (!this.facilitiesMap.has(facilityName)) {
            this.facilitiesMap.set(facilityName, {
              name: facilityName,
              count: 1
            });
          } else {
            this.facilitiesMap.get(facilityName).count++;
          }
        }
      }

      console.log(`📊 Found ${this.facilitiesMap.size} unique facilities`);

      // Second pass: insert facilities into database
      for (const [facilityName, facilityData] of this.facilitiesMap) {
        try {
          // Check if facility already exists
          const existingFacility = await this.client.query(
            'SELECT id FROM facilities WHERE name = $1',
            [facilityName]
          );

          if (existingFacility.rows.length === 0) {
            // Insert new facility
            const result = await this.client.query(`
              INSERT INTO facilities (name, description)
              VALUES ($1, $2)
              RETURNING id
            `, [facilityName, `Facility: ${facilityName}`]);

            facilityData.id = result.rows[0].id;
            newFacilities++;
            console.log(`✅ Created facility: ${facilityName}`);
          } else {
            facilityData.id = existingFacility.rows[0].id;
            console.log(`⏭️  Facility already exists: ${facilityName}`);
          }
        } catch (error) {
          console.error(`❌ Error inserting facility ${facilityName}:`, error.message);
        }
      }

      // Third pass: create project-facility relationships
      console.log('\n🔗 Creating project-facility relationships...');
      
      for (const projectData of projectFacilitiesData) {
        // Get project ID by name
        const projectResult = await this.client.query(
          'SELECT id FROM projects WHERE name = $1 OR project_name = $1',
          [projectData.projectName]
        );

        if (projectResult.rows.length > 0) {
          const projectId = projectResult.rows[0].id;

          for (const facilityName of projectData.facilities) {
            const facilityData = this.facilitiesMap.get(facilityName);
            if (facilityData && facilityData.id) {
              try {
                // Check if relationship already exists
                const existingRelationship = await this.client.query(
                  'SELECT id FROM project_facilities WHERE project_id = $1 AND facility_id = $2',
                  [projectId, facilityData.id]
                );

                if (existingRelationship.rows.length === 0) {
                  // Create new relationship
                  await this.client.query(`
                    INSERT INTO project_facilities (project_id, facility_id)
                    VALUES ($1, $2)
                  `, [projectId, facilityData.id]);

                  newRelationships++;
                  console.log(`✅ Linked facility "${facilityName}" to project "${projectData.projectName}"`);
                } else {
                  console.log(`⏭️  Relationship already exists: ${projectData.projectName} - ${facilityName}`);
                }
              } catch (error) {
                console.error(`❌ Error creating relationship for ${projectData.projectName} - ${facilityName}:`, error.message);
              }
            }
          }
        } else {
          console.log(`⚠️  Project not found: ${projectData.projectName}`);
        }
      }

      console.log(`\n🎉 Facilities import completed!`);
      console.log(`📊 Summary:`);
      console.log(`   - Total unique facilities: ${this.facilitiesMap.size}`);
      console.log(`   - New facilities created: ${newFacilities}`);
      console.log(`   - New relationships created: ${newRelationships}`);

    } catch (error) {
      console.error('❌ Error processing facilities:', error.message);
      throw error;
    }
  }

  // Main import method
  async importFromCSV(csvFilePath) {
    try {
      await this.connect();
      
      // Ensure tables exist
      await this.ensureFacilitiesTable();
      await this.ensureProjectFacilitiesTable();
      
      // Import facilities data
      const projectFacilitiesData = await this.importFacilitiesFromCSV(csvFilePath);
      
      if (projectFacilitiesData.length === 0) {
        console.log('⚠️  No facilities data found in CSV');
        return;
      }
      
      // Process and import facilities
      await this.processFacilities(projectFacilitiesData);
      
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2] || 'list-projects.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    console.log('\n📋 Usage:');
    console.log('   node import-facilities-from-csv.js [csv-file-path]');
    console.log('\n📁 Example:');
    console.log('   node import-facilities-from-csv.js list-projects.csv');
    process.exit(1);
  }

  console.log('🏢 Facilities Import Tool');
  console.log('========================');
  console.log(`📁 CSV file: ${csvFilePath}`);
  
  const importer = new FacilitiesImporter();
  
  try {
    await importer.importFromCSV(csvFilePath);
    console.log('\n🎉 Facilities import completed successfully!');
  } catch (error) {
    console.error('\n❌ Facilities import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FacilitiesImporter;
