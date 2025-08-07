const knex = require('knex');
const fs = require('fs');
const path = require('path');

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

class ProjectsDataUpdater {
  constructor() {
    this.db = knex(dbConfig);
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Step 1: Ensure proper table structure
  async ensureTableStructure() {
    try {
      this.log('Ensuring proper table structure...');
      
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

    // Floor Plans table (if not exists)
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

    // Unit Availability table (if not exists)
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
  }

  // Step 2: Import projects data
  async importProjectsData(projectsData) {
    try {
      this.log('Importing projects data...');
      
      // Clear existing data if requested
      const existingCount = await this.db('projects').count('* as total');
      this.log(`Found ${existingCount[0].total} existing projects`);
      
      if (existingCount[0].total > 0) {
        this.log('Clearing existing projects data...');
        await this.db('projects').del();
      }
      
      // Insert new projects
      const insertedProjects = await this.db('projects').insert(projectsData).returning('*');
      this.log(`Successfully imported ${insertedProjects.length} projects`, 'success');
      
      return insertedProjects;
    } catch (error) {
      this.log(`Error importing projects: ${error.message}`, 'error');
      throw error;
    }
  }

  // Step 3: Import project images
  async importProjectImages(projectImages) {
    try {
      this.log('Importing project images...');
      
      // Clear existing images
      await this.db('project_images').del();
      
      // Insert new images
      const insertedImages = await this.db('project_images').insert(projectImages).returning('*');
      this.log(`Successfully imported ${insertedImages.length} project images`, 'success');
      
      return insertedImages;
    } catch (error) {
      this.log(`Error importing project images: ${error.message}`, 'error');
      throw error;
    }
  }

  // Step 4: Import floor plans
  async importFloorPlans(floorPlans) {
    try {
      this.log('Importing floor plans...');
      
      // Clear existing floor plans
      await this.db('floor_plans').del();
      
      // Insert new floor plans
      const insertedFloorPlans = await this.db('floor_plans').insert(floorPlans).returning('*');
      this.log(`Successfully imported ${insertedFloorPlans.length} floor plans`, 'success');
      
      return insertedFloorPlans;
    } catch (error) {
      this.log(`Error importing floor plans: ${error.message}`, 'error');
      throw error;
    }
  }

  // Step 5: Import unit availability/pricing
  async importUnitAvailability(unitAvailability) {
    try {
      this.log('Importing unit availability and pricing...');
      
      // Clear existing unit availability
      await this.db('unit_availability').del();
      
      // Insert new unit availability
      const insertedUnits = await this.db('unit_availability').insert(unitAvailability).returning('*');
      this.log(`Successfully imported ${insertedUnits.length} unit availability records`, 'success');
      
      return insertedUnits;
    } catch (error) {
      this.log(`Error importing unit availability: ${error.message}`, 'error');
      throw error;
    }
  }

  // Step 6: Import site plans (as project images with specific type)
  async importSitePlans(sitePlans) {
    try {
      this.log('Importing site plans...');
      
      // Site plans are typically stored as project images with a specific type
      const sitePlanImages = sitePlans.map(plan => ({
        project_id: plan.project_id,
        image_url: plan.image_url,
        display_order: plan.display_order || 0,
        alt_text: plan.alt_text || 'Site Plan',
        is_primary: plan.is_primary || false,
        caption: plan.caption || 'Site Plan'
      }));
      
      // Insert site plans as project images
      const insertedSitePlans = await this.db('project_images').insert(sitePlanImages).returning('*');
      this.log(`Successfully imported ${insertedSitePlans.length} site plans`, 'success');
      
      return insertedSitePlans;
    } catch (error) {
      this.log(`Error importing site plans: ${error.message}`, 'error');
      throw error;
    }
  }

  // Helper method to load data from JSON file
  async loadDataFromFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      this.log(`Error loading data from file: ${error.message}`, 'error');
      throw error;
    }
  }

  // Main method to run the complete update
  async updateAllData(dataFiles = {}) {
    try {
      this.log('🚀 Starting comprehensive projects data update...');
      
      // Step 1: Ensure proper table structure
      await this.ensureTableStructure();
      
      // Step 2: Import projects data
      if (dataFiles.projects) {
        const projectsData = await this.loadDataFromFile(dataFiles.projects);
        await this.importProjectsData(projectsData);
      }
      
      // Step 3: Import project images
      if (dataFiles.images) {
        const imagesData = await this.loadDataFromFile(dataFiles.images);
        await this.importProjectImages(imagesData);
      }
      
      // Step 4: Import floor plans
      if (dataFiles.floorPlans) {
        const floorPlansData = await this.loadDataFromFile(dataFiles.floorPlans);
        await this.importFloorPlans(floorPlansData);
      }
      
      // Step 5: Import unit availability/pricing
      if (dataFiles.unitAvailability) {
        const unitData = await this.loadDataFromFile(dataFiles.unitAvailability);
        await this.importUnitAvailability(unitData);
      }
      
      // Step 6: Import site plans
      if (dataFiles.sitePlans) {
        const sitePlansData = await this.loadDataFromFile(dataFiles.sitePlans);
        await this.importSitePlans(sitePlansData);
      }
      
      this.log('🎉 All data updated successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Update failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.db.destroy();
    }
  }

  // Method to create sample data structure
  createSampleDataStructure() {
    const sampleData = {
      projects: [
        {
          name: "Sample Project",
          project_name: "sample-project",
          slug: "sample-project",
          title: "Sample Project Title",
          location: "Sample Location",
          address: "123 Sample Street",
          type: "Residential",
          price: "500,000",
          price_from: "450,000",
          price_per_sqft: "1,200",
          bedrooms: "2-4",
          bathrooms: "2-3",
          size: "800-1500 sqft",
          units: "150",
          developer: "Sample Developer",
          completion: "2024",
          description: "Sample project description",
          features: ["Swimming Pool", "Gym", "Parking"],
          district: "Sample District",
          tenure: "Freehold",
          property_type: "Apartment",
          status: "Under Construction",
          total_units: "150",
          total_floors: "25",
          site_area: "50,000 sqft",
          latitude: 25.2048,
          longitude: 55.2708,
          image_url_banner: "https://example.com/banner.jpg"
        }
      ],
      images: [
        {
          project_id: 1,
          image_url: "https://example.com/image1.jpg",
          display_order: 1,
          alt_text: "Project Image 1",
          is_primary: true,
          caption: "Main project image"
        }
      ],
      floorPlans: [
        {
          project_id: 1,
          project_name: "Sample Project",
          floor_plan_type: "2BR",
          floor_plan_name: "2 Bedroom Type A",
          img: "https://example.com/floorplan.jpg",
          unit_type: "2BR",
          bedrooms: "2",
          bathrooms: "2",
          size_sqft: 1200.00,
          price: "500,000",
          description: "2 bedroom floor plan"
        }
      ],
      unitAvailability: [
        {
          project_id: 1,
          project_name: "Sample Project",
          unit_type: "2BR",
          bedrooms: "2",
          bathrooms: "2",
          size_sqft: 1200.00,
          price: "500,000",
          available_units: 10,
          description: "2 bedroom units available"
        }
      ],
      sitePlans: [
        {
          project_id: 1,
          image_url: "https://example.com/siteplan.jpg",
          display_order: 0,
          alt_text: "Site Plan",
          is_primary: false,
          caption: "Project Site Plan"
        }
      ]
    };

    // Save sample data to files
    Object.entries(sampleData).forEach(([key, data]) => {
      const fileName = `sample-${key}.json`;
      fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
      console.log(`✅ Created ${fileName}`);
    });

    console.log('\n📋 Sample data structure created!');
    console.log('📝 You can now:');
    console.log('   1. Replace the sample data with your actual data');
    console.log('   2. Run: node update-projects-data.js --data-files');
    console.log('   3. Or use the individual methods in your own script');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const updater = new ProjectsDataUpdater();
  
  try {
    if (args.includes('--create-samples')) {
      updater.createSampleDataStructure();
    } else if (args.includes('--data-files')) {
      // Update with data files
      const dataFiles = {
        projects: 'projects.json',
        images: 'project-images.json',
        floorPlans: 'floor-plans.json',
        unitAvailability: 'unit-availability.json',
        sitePlans: 'site-plans.json'
      };
      
      await updater.updateAllData(dataFiles);
    } else {
      console.log('🚀 Projects Data Updater');
      console.log('========================');
      console.log('');
      console.log('Usage:');
      console.log('  node update-projects-data.js --create-samples');
      console.log('    Create sample data structure files');
      console.log('');
      console.log('  node update-projects-data.js --data-files');
      console.log('    Update database with data from JSON files');
      console.log('');
      console.log('Available data files:');
      console.log('  - projects.json');
      console.log('  - project-images.json');
      console.log('  - floor-plans.json');
      console.log('  - unit-availability.json');
      console.log('  - site-plans.json');
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

module.exports = ProjectsDataUpdater;
