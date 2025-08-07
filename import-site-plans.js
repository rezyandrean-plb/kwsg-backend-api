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

class SitePlansImporter {
  constructor() {
    this.db = knex(dbConfig);
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Ensure site_plans table exists
  async ensureSitePlansTable() {
    try {
      const sitePlansExists = await this.db.schema.hasTable('site_plans');
      
      if (sitePlansExists) {
        this.log('ℹ️ site_plans table already exists');
      } else {
        this.log('❌ site_plans table does not exist', 'error');
        throw new Error('site_plans table does not exist');
      }
    } catch (error) {
      this.log(`Error checking site_plans table: ${error.message}`, 'error');
      throw error;
    }
  }

  // Clear existing site plans data
  async clearSitePlansData() {
    try {
      this.log('🗑️  Clearing existing site plans data...');
      const result = await this.db('site_plans').del();
      this.log(`Cleared ${result} existing site plan records`);
    } catch (error) {
      this.log(`Error clearing site plans: ${error.message}`, 'error');
      throw error;
    }
  }

  // Import site plans from CSV
  async importSitePlansFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Skip rows with empty image URLs
          if (!data.img || data.img.trim() === '') {
            return;
          }

          // Transform CSV data to match database schema
          const sitePlan = {
            project_name: data.projectName || '',
            site_plan_id: data.projectId || '',
            site_plan_name: this.extractSitePlanNameFromUrl(data.img),
            image_url: data.img.trim(),
            description: this.extractSitePlanNameFromUrl(data.img),
            layout_info: null, // Will be populated later if needed
            is_primary: true, // Default to primary site plan
            created_at: new Date(),
            updated_at: new Date()
          };

          results.push(sitePlan);
        })
        .on('end', () => {
          this.log(`📥 Processed ${results.length} site plan records from CSV`);
          resolve(results);
        })
        .on('error', (error) => {
          this.log(`Error reading CSV: ${error.message}`, 'error');
          reject(error);
        });
    });
  }

  // Extract site plan name from URL
  extractSitePlanNameFromUrl(url) {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return filename.replace(/\.(jpg|jpeg|png|gif)$/i, '').replace(/_/g, ' ').replace(/-/g, ' ');
    } catch (error) {
      return 'Site Plan';
    }
  }

  // Link site plans to projects
  async linkSitePlansToProjects(sitePlansData) {
    this.log('🔗 Linking site plans to projects...');
    
    const linkedData = [];
    let linkedCount = 0;
    let unlinkedCount = 0;

    for (const sitePlan of sitePlansData) {
      // Try to find project by project name
      let project = null;
      
      if (sitePlan.project_name) {
        // Try to find by project name (exact match first, then partial)
        project = await this.db('projects')
          .where('name', sitePlan.project_name)
          .orWhere('project_name', sitePlan.project_name)
          .orWhere('name', 'ILIKE', `%${sitePlan.project_name}%`)
          .orWhere('project_name', 'ILIKE', `%${sitePlan.project_name}%`)
          .first();
      }

      if (project) {
        // Add project_id to the site plan data
        sitePlan.project_id = project.id;
        linkedData.push(sitePlan);
        linkedCount++;
      } else {
        // Keep the site plan even if project not found, but mark it
        sitePlan.project_name = sitePlan.project_name || 'Unknown Project';
        linkedData.push(sitePlan);
        unlinkedCount++;
        this.log(`⚠️  Project not found for: ${sitePlan.project_name}`, 'warning');
      }
    }

    this.log(`✅ Linked ${linkedCount} site plans to projects`);
    if (unlinkedCount > 0) {
      this.log(`⚠️  ${unlinkedCount} site plans could not be linked to projects`, 'warning');
    }

    return linkedData;
  }

  // Insert site plans into database
  async insertSitePlans(sitePlansData) {
    try {
      this.log('💾 Inserting site plans into database...');
      
      // Insert in batches to avoid memory issues
      const batchSize = 50;
      let insertedCount = 0;
      
      for (let i = 0; i < sitePlansData.length; i += batchSize) {
        const batch = sitePlansData.slice(i, i + batchSize);
        const result = await this.db('site_plans').insert(batch).returning('id');
        insertedCount += result.length;
        this.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}: ${result.length} records`);
      }
      
      this.log(`✅ Successfully inserted ${insertedCount} site plans`, 'success');
      return insertedCount;
    } catch (error) {
      this.log(`Error inserting site plans: ${error.message}`, 'error');
      throw error;
    }
  }

  // Main import method
  async importSitePlans(csvFilePath) {
    try {
      this.log('🚀 Starting site plans import process...');
      
      // Step 1: Ensure table exists
      await this.ensureSitePlansTable();
      
      // Step 2: Clear existing data
      await this.clearSitePlansData();
      
      // Step 3: Import from CSV
      this.log('📥 Importing site plans from CSV...');
      const sitePlans = await this.importSitePlansFromCSV(csvFilePath);
      
      // Step 4: Link to projects
      const linkedSitePlans = await this.linkSitePlansToProjects(sitePlans);
      
      // Step 5: Insert into database
      const insertedCount = await this.insertSitePlans(linkedSitePlans);
      
      // Step 6: Summary
      this.log('📊 Import Summary:', 'success');
      this.log(`   📥 Total records processed: ${sitePlans.length}`);
      this.log(`   💾 Successfully inserted: ${insertedCount}`);
      this.log(`   🔗 Linked to projects: ${linkedSitePlans.length - (sitePlans.length - linkedSitePlans.length)}`);
      
      this.log('🎉 Site plans import completed successfully!', 'success');
      
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
  const csvFilePath = process.argv[2] || 'site_plans.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }

  const importer = new SitePlansImporter();
  await importer.importSitePlans(csvFilePath);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SitePlansImporter;
