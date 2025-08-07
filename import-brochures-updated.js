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

class BrochuresImporter {
  constructor() {
    this.db = knex(dbConfig);
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Ensure brochures table exists
  async ensureBrochuresTable() {
    try {
      const brochuresExists = await this.db.schema.hasTable('brochures');
      
      if (brochuresExists) {
        this.log('ℹ️ brochures table already exists');
      } else {
        this.log('❌ brochures table does not exist', 'error');
        throw new Error('brochures table does not exist');
      }
    } catch (error) {
      this.log(`Error checking brochures table: ${error.message}`, 'error');
      throw error;
    }
  }

  // Clear existing brochures data
  async clearBrochuresData() {
    try {
      this.log('🗑️  Clearing existing brochures data...');
      const result = await this.db('brochures').del();
      this.log(`Cleared ${result} existing brochure records`);
    } catch (error) {
      this.log(`Error clearing brochures: ${error.message}`, 'error');
      throw error;
    }
  }

  // Import brochures from CSV
  async importBrochuresFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Skip rows with empty URLs
          if (!data.url || data.url.trim() === '') {
            return;
          }

          // Transform CSV data to match database schema
          const brochure = {
            project_name: data.projectName || '',
            brochure_url: data.url.trim(),
            brochure_title: data.title || this.extractTitleFromUrl(data.url),
            description: data.title || this.extractTitleFromUrl(data.url),
            file_type: 'PDF', // All files are PDFs
            file_size: null, // Will be updated later if needed
            is_active: true,
            document_id: data.projectId || '',
            published_at: new Date(),
            locale: 'en' // Default to English
          };

          results.push(brochure);
        })
        .on('end', () => {
          this.log(`📥 Processed ${results.length} brochure records from CSV`);
          resolve(results);
        })
        .on('error', (error) => {
          this.log(`Error reading CSV: ${error.message}`, 'error');
          reject(error);
        });
    });
  }

  // Extract title from URL if not provided
  extractTitleFromUrl(url) {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return filename.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ');
    } catch (error) {
      return 'Brochure';
    }
  }

  // Link brochures to projects
  async linkBrochuresToProjects(brochuresData) {
    this.log('🔗 Linking brochures to projects...');
    
    const linkedData = [];
    let linkedCount = 0;
    let unlinkedCount = 0;

    for (const brochure of brochuresData) {
      // Try to find project by project name
      let project = null;
      
      if (brochure.project_name) {
        // Try to find by project name (exact match first, then partial)
        project = await this.db('projects')
          .where('name', brochure.project_name)
          .orWhere('project_name', brochure.project_name)
          .orWhere('name', 'ILIKE', `%${brochure.project_name}%`)
          .orWhere('project_name', 'ILIKE', `%${brochure.project_name}%`)
          .first();
      }

      if (project) {
        linkedData.push(brochure);
        linkedCount++;
      } else {
        // Keep the brochure even if project not found, but mark it
        brochure.project_name = brochure.project_name || 'Unknown Project';
        linkedData.push(brochure);
        unlinkedCount++;
        this.log(`⚠️  Project not found for: ${brochure.project_name}`, 'warning');
      }
    }

    this.log(`✅ Linked ${linkedCount} brochures to projects`);
    if (unlinkedCount > 0) {
      this.log(`⚠️  ${unlinkedCount} brochures could not be linked to projects`, 'warning');
    }

    return linkedData;
  }

  // Insert brochures into database
  async insertBrochures(brochuresData) {
    try {
      this.log('💾 Inserting brochures into database...');
      
      // Insert in batches to avoid memory issues
      const batchSize = 50;
      let insertedCount = 0;
      
      for (let i = 0; i < brochuresData.length; i += batchSize) {
        const batch = brochuresData.slice(i, i + batchSize);
        const result = await this.db('brochures').insert(batch).returning('id');
        insertedCount += result.length;
        this.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}: ${result.length} records`);
      }
      
      this.log(`✅ Successfully inserted ${insertedCount} brochures`, 'success');
      return insertedCount;
    } catch (error) {
      this.log(`Error inserting brochures: ${error.message}`, 'error');
      throw error;
    }
  }

  // Main import method
  async importBrochures(csvFilePath) {
    try {
      this.log('🚀 Starting brochures import process...');
      
      // Step 1: Ensure table exists
      await this.ensureBrochuresTable();
      
      // Step 2: Clear existing data
      await this.clearBrochuresData();
      
      // Step 3: Import from CSV
      this.log('📥 Importing brochures from CSV...');
      const brochures = await this.importBrochuresFromCSV(csvFilePath);
      
      // Step 4: Link to projects
      const linkedBrochures = await this.linkBrochuresToProjects(brochures);
      
      // Step 5: Insert into database
      const insertedCount = await this.insertBrochures(linkedBrochures);
      
      // Step 6: Summary
      this.log('📊 Import Summary:', 'success');
      this.log(`   📥 Total records processed: ${brochures.length}`);
      this.log(`   💾 Successfully inserted: ${insertedCount}`);
      this.log(`   🔗 Linked to projects: ${linkedBrochures.length - (brochures.length - linkedBrochures.length)}`);
      
      this.log('🎉 Brochures import completed successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Import failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.db.destroy();
    }
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2] || 'brochures.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }

  const importer = new BrochuresImporter();
  await importer.importBrochures(csvFilePath);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BrochuresImporter;
