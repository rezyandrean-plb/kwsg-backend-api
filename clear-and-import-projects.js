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

class ProjectsDataManager {
  constructor() {
    this.db = knex(dbConfig);
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Step 1: Clear all existing data
  async clearAllData() {
    try {
      this.log('🗑️  Clearing all existing data...');
      
      // List of tables to clear (in order to respect foreign key constraints)
      const tablesToClear = [
        'unit_availability',
        'unit_pricing',
        'site_plans',
        'floor_plans', 
        'project_images',
        'project_details',
        'brochures',
        'press_articles',
        'projects',
        'project' // Also clear the old table name if it exists
      ];
      
      for (const tableName of tablesToClear) {
        try {
          const tableExists = await this.db.schema.hasTable(tableName);
          if (tableExists) {
            const result = await this.db(tableName).del();
            this.log(`Cleared ${result} records from ${tableName}`, 'success');
          } else {
            this.log(`Table ${tableName} does not exist, skipping`, 'warning');
          }
        } catch (error) {
          this.log(`Error clearing ${tableName}: ${error.message}`, 'warning');
        }
      }
      
      this.log('✅ All existing data cleared successfully', 'success');
      
    } catch (error) {
      this.log(`Error clearing data: ${error.message}`, 'error');
      throw error;
    }
  }

  // Step 2: Ensure proper table structure
  async ensureTableStructure() {
    try {
      this.log('🔧 Ensuring proper table structure...');
      
      // Check if projects table exists (plural - what the API expects)
      const projectsExists = await this.db.schema.hasTable('projects');
      const projectExists = await this.db.schema.hasTable('project');
      
      if (!projectsExists && projectExists) {
        this.log('Renaming project table to projects...');
        await this.db.raw('ALTER TABLE project RENAME TO projects');
        this.log('Table renamed successfully', 'success');
      } else if (!projectsExists && !projectExists) {
        this.log('Creating projects table...');
        await this.createProjectsTable();
        this.log('Projects table created successfully', 'success');
      } else {
        this.log('Projects table already exists', 'success');
      }
      
      // Ensure related tables exist
      await this.ensureRelatedTables();
      
    } catch (error) {
      this.log(`Error ensuring table structure: ${error.message}`, 'error');
      throw error;
    }
  }

  async createProjectsTable() {
    await this.db.schema.createTable('projects', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('project_name');
      table.string('project_id'); // Your CSV has projectId
      table.string('slug').unique();
      table.string('title');
      table.string('location');
      table.text('address');
      table.string('type');
      table.string('price');
      table.string('price_from');
      table.string('price_per_sqft');
      table.string('bedrooms');
      table.string('bathrooms');
      table.string('size');
      table.string('units');
      table.string('developer');
      table.string('completion');
      table.text('description');
      table.json('features');
      table.string('district');
      table.string('tenure');
      table.string('property_type');
      table.string('status');
      table.string('total_units');
      table.string('total_floors');
      table.string('site_area');
      table.decimal('latitude', 10, 8);
      table.decimal('longitude', 11, 8);
      table.string('image_url_banner');
      table.timestamps(true, true);
      
      // Add indexes
      table.index('name');
      table.index('location');
      table.index('developer');
      table.index('slug');
      table.index('project_id');
    });
  }

  async ensureRelatedTables() {
    // Project Images table
    const projectImagesExists = await this.db.schema.hasTable('project_images');
    if (!projectImagesExists) {
      this.log('Creating project_images table...');
      await this.db.schema.createTable('project_images', (table) => {
        table.increments('id').primary();
        table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE');
        table.string('image_url').notNullable();
        table.integer('display_order').defaultTo(0);
        table.string('alt_text');
        table.boolean('is_primary').defaultTo(false);
        table.string('caption');
        table.timestamps(true, true);
        
        table.index('project_id');
        table.index('display_order');
      });
    }

    // Project Details table (for additional data not in main projects table)
    const projectDetailsExists = await this.db.schema.hasTable('project_details');
    if (!projectDetailsExists) {
      this.log('Creating project_details table...');
      await this.db.schema.createTable('project_details', (table) => {
        table.increments('id').primary();
        table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE');
        table.string('project_id_external'); // Your CSV projectId
        table.date('launch_date');
        table.date('completion_date');
        table.string('project_area');
        table.string('project_type');
        table.string('construction_status');
        table.string('land_tenure');
        table.decimal('land_size', 15, 2);
        table.string('land_size_unit');
        table.integer('total_floors');
        table.integer('underground_floors');
        table.string('architect');
        table.string('main_contractor');
        table.text('project_description');
        table.json('amenities');
        table.json('transportation');
        table.json('nearby_facilities');
        table.timestamps(true, true);
        
        table.index('project_id');
        table.index('project_id_external');
        table.index('launch_date');
        table.index('completion_date');
      });
    }

    // Floor Plans table
    const floorPlansExists = await this.db.schema.hasTable('floor_plans');
    if (!floorPlansExists) {
      this.log('Creating floor_plans table...');
      await this.db.schema.createTable('floor_plans', (table) => {
        table.increments('id').primary();
        table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE');
        table.string('project_name');
        table.string('floor_plan_id');
        table.string('floor_plan_type');
        table.string('floor_plan_name');
        table.string('img');
        table.string('unit_type');
        table.string('bedrooms');
        table.string('bathrooms');
        table.decimal('size_sqft', 10, 2);
        table.string('price');
        table.string('floor_plan_image');
        table.text('description');
        table.boolean('is_available').defaultTo(true);
        table.timestamps(true, true);
        
        table.index('project_id');
        table.index('project_name');
        table.index('floor_plan_id');
        table.index('is_available');
      });
    }

    // Unit Availability table
    const unitAvailabilityExists = await this.db.schema.hasTable('unit_availability');
    if (!unitAvailabilityExists) {
      this.log('Creating unit_availability table...');
      await this.db.schema.createTable('unit_availability', (table) => {
        table.increments('id').primary();
        table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE');
        table.string('project_name');
        table.string('unit_type');
        table.string('bedrooms');
        table.string('bathrooms');
        table.decimal('size_sqft', 10, 2);
        table.string('price');
        table.integer('available_units').defaultTo(0);
        table.string('img');
        table.text('description');
        table.boolean('is_available').defaultTo(true);
        table.timestamps(true, true);
        
        table.index('project_id');
        table.index('project_name');
        table.index('unit_type');
        table.index('is_available');
      });
    }

    // Unit Pricing table
    const unitPricingExists = await this.db.schema.hasTable('unit_pricing');
    if (!unitPricingExists) {
      this.log('Creating unit_pricing table...');
      await this.db.schema.createTable('unit_pricing', (table) => {
        table.increments('id').primary();
        table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE');
        table.string('project_name');
        table.string('unit_type');
        table.string('bedrooms');
        table.string('bathrooms');
        table.decimal('size_sqft', 10, 2);
        table.decimal('price_from', 15, 2);
        table.decimal('price_to', 15, 2);
        table.decimal('price_per_sqft', 10, 2);
        table.string('currency').defaultTo('SGD');
        table.string('payment_terms');
        table.string('discount_info');
        table.boolean('is_available').defaultTo(true);
        table.timestamps(true, true);
        
        table.index('project_id');
        table.index('project_name');
        table.index('unit_type');
        table.index('is_available');
      });
    }

    // Site Plans table
    const sitePlansExists = await this.db.schema.hasTable('site_plans');
    if (!sitePlansExists) {
      this.log('Creating site_plans table...');
      await this.db.schema.createTable('site_plans', (table) => {
        table.increments('id').primary();
        table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE');
        table.string('project_name');
        table.string('site_plan_id');
        table.string('site_plan_name');
        table.string('image_url');
        table.text('description');
        table.json('layout_info');
        table.boolean('is_primary').defaultTo(false);
        table.timestamps(true, true);
        
        table.index('project_id');
        table.index('project_name');
        table.index('site_plan_id');
      });
    }
  }

  // Step 3: Import projects from your CSV
  async importProjectsFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Transform your CSV data to match database schema
          const project = {
            name: data.projectName || '',
            project_name: data.projectName || '',
            slug: this.generateSlug(data.projectName || ''),
            title: data.projectName || '',
            location: data.district || '',
            address: data.streetAddress || '',
            type: 'Residential', // Default value
            price: '', // Will be updated with unit pricing later
            price_from: '',
            price_per_sqft: '',
            bedrooms: '',
            bathrooms: '',
            size: '',
            units: data.unitsNum || '',
            developer: data.developer || '',
            completion: data.completionDate || '',
            description: `Project located in ${data.district || ''}. ${data.facilities || ''}`,
            features: JSON.stringify([]),
            district: data.district || '',
            tenure: data.tenure || '',
            property_type: 'Residential',
            status: 'Active',
            total_units: data.unitsNum || '',
            total_floors: '',
            site_area: data.projectArea || '',
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null
          };
          
          results.push(project);
        })
        .on('end', () => {
          this.log(`Parsed ${results.length} projects from CSV`, 'success');
          resolve(results);
        })
        .on('error', (error) => {
          this.log(`Error parsing CSV: ${error.message}`, 'error');
          reject(error);
        });
    });
  }

  // Parse facilities string into array
  parseFacilities(facilitiesString) {
    if (!facilitiesString) return [];
    
    // Split by newlines and clean up
    return facilitiesString
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => item.replace(/^\d+\.\s*/, '')); // Remove numbering like "1. "
  }

  // Generate slug from name
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Main method to clear and import
  async clearAndImport(csvFilePath) {
    try {
      this.log('🚀 Starting complete data replacement...');
      
      // Step 1: Clear all existing data
      await this.clearAllData();
      
      // Step 2: Ensure proper table structure
      await this.ensureTableStructure();
      
      // Step 3: Import new projects data
      this.log('📥 Importing projects from CSV...');
      const projects = await this.importProjectsFromCSV(csvFilePath);
      
      // Insert new projects
      const insertedProjects = await this.db('projects').insert(projects).returning('*');
      this.log(`✅ Successfully imported ${insertedProjects.length} projects`, 'success');
      
      // Step 4: Summary
      this.log('📊 Import Summary:', 'success');
      this.log(`   - Projects imported: ${insertedProjects.length}`, 'success');
      this.log(`   - Database ready for additional data imports`, 'success');
      this.log(`   - Next: Import unit_pricing, brochures, floor_plans CSV files`, 'success');
      
      this.log('🎉 Data replacement completed successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Import failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.db.destroy();
    }
  }

  // Import additional project details
  async importProjectDetailsFromCSV(csvFilePath, insertedProjects) {
    return new Promise((resolve, reject) => {
      const results = [];
      const projectMap = new Map();
      
      // Create a map of project names to IDs for easy lookup
      insertedProjects.forEach(project => {
        projectMap.set(project.name, project.id);
      });
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          const projectId = projectMap.get(data.projectName);
          if (projectId) {
            const projectDetail = {
              project_id: projectId,
              project_id_external: data.projectId || '',
              launch_date: data.launchDate ? new Date(data.launchDate) : null,
              completion_date: data.completionDate ? new Date(data.completionDate) : null,
              project_area: data.projectArea || '',
              project_type: 'Residential',
              construction_status: 'Under Construction',
              land_tenure: data.tenure || '',
              land_size: null,
              land_size_unit: 'sqft',
              total_floors: null,
              underground_floors: 0,
              architect: '',
              main_contractor: '',
              project_description: `Detailed information for ${data.projectName}`,
              amenities: data.facilities ? this.parseFacilities(data.facilities) : [],
              transportation: [],
              nearby_facilities: []
            };
            
            results.push(projectDetail);
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Method to prepare for next imports
  async prepareForNextImports() {
    this.log('📋 Ready for additional data imports:', 'info');
    this.log('   - Floor plans: floor-plans.csv', 'info');
    this.log('   - Unit pricing: unit-pricing.csv', 'info');
    this.log('   - Project images: project-images.csv', 'info');
    this.log('   - Brochures: brochures.csv', 'info');
    this.log('', 'info');
    this.log('💡 Use the existing import scripts for these:', 'info');
    this.log('   node import-projects-from-csv.js --import', 'info');
    this.log('   node update-projects-data.js --data-files', 'info');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const manager = new ProjectsDataManager();
  
  try {
    if (args.includes('--clear-and-import')) {
      const csvFile = args[1] || 'list-projects.csv';
      await manager.clearAndImport(csvFile);
      await manager.prepareForNextImports();
    } else {
      console.log('🚀 Projects Data Clear & Import Tool');
      console.log('====================================');
      console.log('');
      console.log('Usage:');
      console.log('  node clear-and-import-projects.js --clear-and-import [csv-file]');
      console.log('    Clear all data and import from CSV file');
      console.log('');
      console.log('Example:');
      console.log('  node clear-and-import-projects.js --clear-and-import list-projects.csv');
      console.log('');
      console.log('⚠️  WARNING: This will DELETE ALL existing data!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = ProjectsDataManager;
