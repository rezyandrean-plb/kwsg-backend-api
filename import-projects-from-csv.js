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

class ProjectsCSVImporter {
  constructor() {
    this.db = knex(dbConfig);
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Ensure projects table exists
  async ensureProjectsTable() {
    try {
      const projectsExists = await this.db.schema.hasTable('projects');
      const projectExists = await this.db.schema.hasTable('project');
      
      if (!projectsExists && projectExists) {
        this.log('Renaming project table to projects...');
        await this.db.raw('ALTER TABLE project RENAME TO projects');
      } else if (!projectsExists && !projectExists) {
        this.log('Creating projects table...');
        await this.createProjectsTable();
      }
    } catch (error) {
      this.log(`Error ensuring table: ${error.message}`, 'error');
      throw error;
    }
  }

  async createProjectsTable() {
    await this.db.schema.createTable('projects', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('project_name');
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
      
      table.index('name');
      table.index('location');
      table.index('developer');
      table.index('slug');
    });
  }

  // Import projects from CSV
  async importProjectsFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Transform CSV data to match database schema
          const project = {
            name: data.name || data.project_name || '',
            project_name: data.project_name || data.name || '',
            slug: this.generateSlug(data.name || data.project_name || ''),
            title: data.title || '',
            location: data.location || '',
            address: data.address || '',
            type: data.type || data.property_type || '',
            price: data.price || '',
            price_from: data.price_from || data.price || '',
            price_per_sqft: data.price_per_sqft || data.price_per_sqm || '',
            bedrooms: data.bedrooms || '',
            bathrooms: data.bathrooms || '',
            size: data.size || data.size_sqft || '',
            units: data.units || data.total_units || '',
            developer: data.developer || '',
            completion: data.completion || '',
            description: data.description || '',
            features: data.features ? JSON.parse(data.features) : [],
            district: data.district || '',
            tenure: data.tenure || '',
            property_type: data.property_type || data.type || '',
            status: data.status || '',
            total_units: data.total_units || data.units || '',
            total_floors: data.total_floors || '',
            site_area: data.site_area || '',
            latitude: parseFloat(data.latitude) || null,
            longitude: parseFloat(data.longitude) || null,
            image_url_banner: data.image_url_banner || data.banner_image || ''
          };
          
          results.push(project);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Import floor plans from CSV
  async importFloorPlansFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          const floorPlan = {
            project_id: parseInt(data.project_id) || null,
            project_name: data.project_name || '',
            floor_plan_id: data.floor_plan_id || '',
            floor_plan_type: data.floor_plan_type || data.unit_type || '',
            floor_plan_name: data.floor_plan_name || '',
            img: data.img || data.image_url || data.floor_plan_image || '',
            unit_type: data.unit_type || data.floor_plan_type || '',
            bedrooms: data.bedrooms || '',
            bathrooms: data.bathrooms || '',
            size_sqft: parseFloat(data.size_sqft) || parseFloat(data.size) || null,
            price: data.price || '',
            floor_plan_image: data.floor_plan_image || data.img || data.image_url || '',
            description: data.description || '',
            is_available: data.is_available === 'true' || data.is_available === '1'
          };
          
          results.push(floorPlan);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Import unit availability from CSV
  async importUnitAvailabilityFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          const unitAvailability = {
            project_id: parseInt(data.project_id) || null,
            project_name: data.project_name || '',
            unit_type: data.unit_type || '',
            bedrooms: data.bedrooms || '',
            bathrooms: data.bathrooms || '',
            size_sqft: parseFloat(data.size_sqft) || parseFloat(data.size) || null,
            price: data.price || '',
            available_units: parseInt(data.available_units) || 0,
            img: data.img || data.image_url || '',
            description: data.description || '',
            is_available: data.is_available === 'true' || data.is_available === '1'
          };
          
          results.push(unitAvailability);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Generate slug from name
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Main import method
  async importFromCSV(csvFiles) {
    try {
      this.log('🚀 Starting CSV import...');
      
      // Ensure table structure
      await this.ensureProjectsTable();
      
      // Import projects
      if (csvFiles.projects) {
        this.log('Importing projects from CSV...');
        const projects = await this.importProjectsFromCSV(csvFiles.projects);
        
        // Clear existing projects
        await this.db('projects').del();
        
        // Insert new projects
        const insertedProjects = await this.db('projects').insert(projects).returning('*');
        this.log(`✅ Imported ${insertedProjects.length} projects`, 'success');
      }
      
      // Import floor plans
      if (csvFiles.floorPlans) {
        this.log('Importing floor plans from CSV...');
        const floorPlans = await this.importFloorPlansFromCSV(csvFiles.floorPlans);
        
        // Ensure floor_plans table exists
        const floorPlansExists = await this.db.schema.hasTable('floor_plans');
        if (!floorPlansExists) {
          await this.createFloorPlansTable();
        }
        
        // Clear existing floor plans
        await this.db('floor_plans').del();
        
        // Insert new floor plans
        const insertedFloorPlans = await this.db('floor_plans').insert(floorPlans).returning('*');
        this.log(`✅ Imported ${insertedFloorPlans.length} floor plans`, 'success');
      }
      
      // Import unit availability
      if (csvFiles.unitAvailability) {
        this.log('Importing unit availability from CSV...');
        const unitAvailability = await this.importUnitAvailabilityFromCSV(csvFiles.unitAvailability);
        
        // Ensure unit_availability table exists
        const unitAvailabilityExists = await this.db.schema.hasTable('unit_availability');
        if (!unitAvailabilityExists) {
          await this.createUnitAvailabilityTable();
        }
        
        // Clear existing unit availability
        await this.db('unit_availability').del();
        
        // Insert new unit availability
        const insertedUnits = await this.db('unit_availability').insert(unitAvailability).returning('*');
        this.log(`✅ Imported ${insertedUnits.length} unit availability records`, 'success');
      }
      
      this.log('🎉 CSV import completed successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Import failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.db.destroy();
    }
  }

  async createFloorPlansTable() {
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

  async createUnitAvailabilityTable() {
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

  // Create sample CSV files
  createSampleCSVFiles() {
    // Sample projects CSV
    const projectsCSV = `name,project_name,title,location,address,type,price,price_from,price_per_sqft,bedrooms,bathrooms,size,units,developer,completion,description,district,tenure,property_type,status,total_units,total_floors,site_area,latitude,longitude,image_url_banner
"Sample Project","sample-project","Sample Project Title","Sample Location","123 Sample Street","Residential","500000","450000","1200","2-4","2-3","800-1500 sqft","150","Sample Developer","2024","Sample project description","Sample District","Freehold","Apartment","Under Construction","150","25","50000 sqft","25.2048","55.2708","https://example.com/banner.jpg"`;

    // Sample floor plans CSV
    const floorPlansCSV = `project_id,project_name,floor_plan_type,floor_plan_name,img,unit_type,bedrooms,bathrooms,size_sqft,price,description,is_available
1,"Sample Project","2BR","2 Bedroom Type A","https://example.com/floorplan.jpg","2BR","2","2","1200.00","500000","2 bedroom floor plan","true"`;

    // Sample unit availability CSV
    const unitAvailabilityCSV = `project_id,project_name,unit_type,bedrooms,bathrooms,size_sqft,price,available_units,description,is_available
1,"Sample Project","2BR","2","2","1200.00","500000","10","2 bedroom units available","true"`;

    // Write sample files
    fs.writeFileSync('sample-projects.csv', projectsCSV);
    fs.writeFileSync('sample-floor-plans.csv', floorPlansCSV);
    fs.writeFileSync('sample-unit-availability.csv', unitAvailabilityCSV);

    console.log('✅ Created sample CSV files:');
    console.log('   - sample-projects.csv');
    console.log('   - sample-floor-plans.csv');
    console.log('   - sample-unit-availability.csv');
    console.log('');
    console.log('📝 You can now:');
    console.log('   1. Replace the sample data with your actual data');
    console.log('   2. Run: node import-projects-from-csv.js --import');
    console.log('   3. Or use the individual methods in your own script');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const importer = new ProjectsCSVImporter();
  
  try {
    if (args.includes('--create-samples')) {
      importer.createSampleCSVFiles();
    } else if (args.includes('--import')) {
      // Import from CSV files
      const csvFiles = {
        projects: 'projects.csv',
        floorPlans: 'floor-plans.csv',
        unitAvailability: 'unit-availability.csv'
      };
      
      await importer.importFromCSV(csvFiles);
    } else {
      console.log('🚀 Projects CSV Importer');
      console.log('=======================');
      console.log('');
      console.log('Usage:');
      console.log('  node import-projects-from-csv.js --create-samples');
      console.log('    Create sample CSV files');
      console.log('');
      console.log('  node import-projects-from-csv.js --import');
      console.log('    Import data from CSV files');
      console.log('');
      console.log('Required CSV files:');
      console.log('  - projects.csv');
      console.log('  - floor-plans.csv (optional)');
      console.log('  - unit-availability.csv (optional)');
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

module.exports = ProjectsCSVImporter;
