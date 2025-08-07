const knex = require('knex');
const fs = require('fs');
const csv = require('csv-parser');

// Database configuration
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'kwpostgres',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
};

class FloorPlansImporter {
  constructor() {
    this.db = knex(dbConfig);
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Ensure floor_plans table exists
  async ensureFloorPlansTable() {
    try {
      const floorPlansExists = await this.db.schema.hasTable('floor_plans');
      
      if (floorPlansExists) {
        this.log('ℹ️ floor_plans table already exists');
      } else {
        this.log('❌ floor_plans table does not exist', 'error');
        throw new Error('floor_plans table does not exist');
      }
    } catch (error) {
      this.log(`Error checking floor_plans table: ${error.message}`, 'error');
      throw error;
    }
  }

  // Import floor plans from CSV
  async importFloorPlansFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Skip rows with empty image URLs
          if (!data.img || data.img.trim() === '') {
            return;
          }

          // Transform CSV data to match existing database schema
          const floorPlan = {
            project_name: data.projectName || '',
            floor_plan_id: data.projectId || '', // Using projectId as floor_plan_id
            floor_plan_type: data.floorPlanType || '',
            floor_plan_name: data.floorPlanName || '',
            img: data.img.trim(), // Using existing 'img' column
            is_available: true
          };
          
          results.push(floorPlan);
        })
        .on('end', () => {
          this.log(`📥 Parsed ${results.length} floor plan records from CSV`);
          resolve(results);
        })
        .on('error', (error) => {
          this.log(`Error reading CSV: ${error.message}`, 'error');
          reject(error);
        });
    });
  }

  // Link floor plans to projects
  async linkFloorPlansToProjects(floorPlansData) {
    this.log('🔗 Linking floor plans to projects...');
    
    const linkedData = [];
    let linkedCount = 0;
    let unlinkedCount = 0;

    for (const floorPlan of floorPlansData) {
      // Try to find project by project name
      let project = null;
      
      if (floorPlan.project_name) {
        // Try to find by project name (exact match first, then partial)
        project = await this.db('projects')
          .where('name', floorPlan.project_name)
          .orWhere('project_name', floorPlan.project_name)
          .orWhere('name', 'ILIKE', `%${floorPlan.project_name}%`)
          .orWhere('project_name', 'ILIKE', `%${floorPlan.project_name}%`)
          .first();
      }

      if (project) {
        floorPlan.project_id = project.id;
        linkedData.push(floorPlan);
        linkedCount++;
      } else {
        this.log(`⚠️ Could not find project for: ${floorPlan.project_name}`, 'warning');
        unlinkedCount++;
      }
    }

    this.log(`✅ Linked ${linkedCount} floor plans to projects`);
    if (unlinkedCount > 0) {
      this.log(`⚠️ ${unlinkedCount} floor plans could not be linked`, 'warning');
    }

    return linkedData;
  }

  // Main import method
  async importFloorPlans(csvFilePath) {
    try {
      this.log('🚀 Starting floor plans import...');
      
      // Step 1: Ensure table structure
      await this.ensureFloorPlansTable();
      
      // Step 2: Import from CSV
      this.log('📥 Importing floor plans from CSV...');
      const floorPlans = await this.importFloorPlansFromCSV(csvFilePath);
      
      // Step 3: Link to projects
      const linkedFloorPlans = await this.linkFloorPlansToProjects(floorPlans);
      
      // Step 4: Insert into database
      if (linkedFloorPlans.length > 0) {
        const insertedFloorPlans = await this.db('floor_plans').insert(linkedFloorPlans).returning('*');
        this.log(`✅ Successfully imported ${insertedFloorPlans.length} floor plans`, 'success');
        
        // Step 5: Summary
        this.log('📊 Import Summary:', 'success');
        this.log(`   • Total records processed: ${floorPlans.length}`);
        this.log(`   • Successfully linked: ${linkedFloorPlans.length}`);
        this.log(`   • Failed to link: ${floorPlans.length - linkedFloorPlans.length}`);
        
        return insertedFloorPlans;
      } else {
        this.log('⚠️ No floor plans were linked to projects', 'warning');
        return [];
      }
      
    } catch (error) {
      this.log(`❌ Import failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.db.destroy();
    }
  }
}

// Main execution
if (require.main === module) {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('❌ Please provide the CSV file path as an argument');
    console.log('Usage: node import-floor-plans.js <csv-file-path>');
    process.exit(1);
  }

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }

  const importer = new FloorPlansImporter();
  importer.importFloorPlans(csvFilePath)
    .then(() => {
      console.log('🎉 Floor plans import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error.message);
      process.exit(1);
    });
}

module.exports = FloorPlansImporter;
