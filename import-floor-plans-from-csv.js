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

async function importFloorPlansFromCSV(csvFilePath) {
  let client = null;
  
  try {
    console.log('🔌 Connecting to database...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected successfully!');

    // Check if floor_plans table exists
    console.log('\n📊 Checking if floor_plans table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'floor_plans'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Floor plans table does not exist. Please run the migration first.');
      return;
    }
    
    console.log('✅ Floor plans table exists!');

    // Read CSV file first
    console.log('\n📖 Reading CSV file...');
    const results = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', (error) => reject(error));
    });

    console.log(`📊 Found ${results.length} records in CSV`);
    
    if (results.length === 0) {
      console.log('❌ No data found in CSV file');
      return;
    }

    // Process records in batches to avoid overwhelming the database
    const batchSize = 10;
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)} (${batch.length} records)`);
      
      for (const record of batch) {
        try {
          // Extract data from CSV
          const img = record.img;
          const floorPlanId = record.floorPlanId;
          const floorPlanType = record.floorPlanType;
          const floorPlanName = record.floorPlanName;
          const projectName = record.projectName;

          if (!projectName || !img) {
            console.log(`⚠️  Skipping record: Missing project name or image URL`);
            skipped++;
            continue;
          }

          // Check if floor plan already exists for this project and floor plan ID
          const existingCheck = await client.query(
            'SELECT id FROM floor_plans WHERE project_name = $1 AND floor_plan_id = $2',
            [projectName, floorPlanId]
          );

          if (existingCheck.rows.length > 0) {
            console.log(`⏭️  Skipping: Floor plan already exists for project "${projectName}" with ID "${floorPlanId}"`);
            skipped++;
            continue;
          }

          // Insert floor plan
          const insertResult = await client.query(`
            INSERT INTO floor_plans (
              project_name, floor_plan_id, floor_plan_type, floor_plan_name, img, 
              is_available, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
            RETURNING id
          `, [projectName, floorPlanId, floorPlanType, floorPlanName, img]);

          console.log(`✅ Imported floor plan for project "${projectName}" (ID: ${insertResult.rows[0].id})`);
          imported++;

        } catch (error) {
          console.error(`❌ Error importing record:`, error.message);
          errors++;
        }
      }

      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < results.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n📈 Import Summary:');
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${results.length}`);

  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('\n🔌 Database connection closed.');
      } catch (closeError) {
        console.error('❌ Error closing database connection:', closeError);
      }
    }
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.log('❌ Please provide a CSV file path');
    console.log('Usage: node import-floor-plans-from-csv.js <csv-file-path>');
    console.log('');
    console.log('Expected CSV columns:');
    console.log('- img (required) - Image URL');
    console.log('- floorPlanId (optional) - Floor plan ID');
    console.log('- floorPlanType (optional) - Floor plan type');
    console.log('- floorPlanName (optional) - Floor plan name');
    console.log('- projectName (required) - Project name');
    return;
  }

  if (!fs.existsSync(csvFilePath)) {
    console.log(`❌ CSV file not found: ${csvFilePath}`);
    return;
  }

  console.log(`🚀 Starting floor plans import from: ${csvFilePath}`);
  await importFloorPlansFromCSV(csvFilePath);
}

// Run the script
main().catch(console.error); 