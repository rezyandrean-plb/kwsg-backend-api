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
  }
};

async function importBrochuresFromCSV(csvFilePath) {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Check if brochures table exists
    console.log('\n📊 Checking if brochures table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'brochures'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Brochures table does not exist. Please run the migration first.');
      return;
    }
    
    console.log('✅ Brochures table exists!');

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

    // Process each record
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const record of results) {
      try {
        // Extract data from CSV (adjust column names as needed)
        const projectName = record.projectName || record.project_name || record.name;
        const brochureUrl = record.brochureUrl || record.brochure_url || record.url;
        const brochureTitle = record.brochureTitle || record.brochure_title || record.title;
        const description = record.description || record.desc;
        const fileType = record.fileType || record.file_type || 'pdf';
        const fileSize = record.fileSize || record.file_size;

        if (!projectName || !brochureUrl) {
          console.log(`⚠️  Skipping record: Missing project name or brochure URL`);
          skipped++;
          continue;
        }

        // Check if brochure already exists for this project and URL
        const existingCheck = await client.query(
          'SELECT id FROM brochures WHERE project_name = $1 AND brochure_url = $2',
          [projectName, brochureUrl]
        );

        if (existingCheck.rows.length > 0) {
          console.log(`⏭️  Skipping: Brochure already exists for project "${projectName}"`);
          skipped++;
          continue;
        }

        // Insert brochure
        const insertResult = await client.query(`
          INSERT INTO brochures (project_name, brochure_url, brochure_title, description, file_type, file_size, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
          RETURNING id
        `, [projectName, brochureUrl, brochureTitle, description, fileType, fileSize]);

        console.log(`✅ Imported brochure for project "${projectName}" (ID: ${insertResult.rows[0].id})`);
        imported++;

      } catch (error) {
        console.error(`❌ Error importing record:`, error.message);
        errors++;
      }
    }

    console.log('\n📈 Import Summary:');
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${results.length}`);

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.log('❌ Please provide a CSV file path');
    console.log('Usage: node import-brochures-from-csv.js <csv-file-path>');
    console.log('');
    console.log('Expected CSV columns:');
    console.log('- projectName (or project_name, name)');
    console.log('- brochureUrl (or brochure_url, url)');
    console.log('- brochureTitle (or brochure_title, title) - optional');
    console.log('- description (or desc) - optional');
    console.log('- fileType (or file_type) - optional, defaults to "pdf"');
    console.log('- fileSize (or file_size) - optional');
    return;
  }

  if (!fs.existsSync(csvFilePath)) {
    console.log(`❌ CSV file not found: ${csvFilePath}`);
    return;
  }

  console.log(`🚀 Starting brochure import from: ${csvFilePath}`);
  await importBrochuresFromCSV(csvFilePath);
}

// Run the script
main().catch(console.error); 