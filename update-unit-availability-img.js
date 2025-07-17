const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  database: 'kwsg',
  user: 'postgres',
  password: 'kwpostgres',
  ssl: { rejectUnauthorized: false }
};

async function updateUnitAvailabilityImg(csvFilePath) {
  let client = null;
  try {
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected to database');

    const results = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', (error) => reject(error));
    });

    console.log(`📊 Loaded ${results.length} records from CSV`);

    let updated = 0, skipped = 0, errors = 0;
    
    for (const record of results) {
      try {
        // Extract fields from CSV - adjust column names as needed
        const {
          projectName,  // This should match the project name in unit_availability
          img,          // The image URL to update
          // Add other fields if needed for matching
          unitType,
          subtype
        } = record;

        if (!projectName || !img) {
          console.log('Skipping record: missing projectName or img');
          skipped++;
          continue;
        }

        // First, find the project_id by matching project name
        const projectQuery = `
          SELECT id FROM projects 
          WHERE name = $1 OR project_name = $1
        `;
        const projectResult = await client.query(projectQuery, [projectName]);
        
        if (projectResult.rows.length === 0) {
          console.log(`⚠️  No project found with name: "${projectName}"`);
          skipped++;
          continue;
        }
        
        const projectId = projectResult.rows[0].id;
        console.log(`🔍 Found project_id ${projectId} for project: "${projectName}"`);

        // Build the WHERE clause based on available fields
        let whereClause = 'project_id = $1';
        let params = [projectId];
        let paramIndex = 2;

        // Add unit_type if available
        if (unitType) {
          whereClause += ` AND unit_type = $${paramIndex}`;
          params.push(unitType);
          paramIndex++;
        }

        // Add subtype if available
        if (subtype) {
          whereClause += ` AND subtype = $${paramIndex}`;
          params.push(subtype);
          paramIndex++;
        }

        // Update the img field for matching records
        const updateQuery = `
          UPDATE unit_availability 
          SET img = $${paramIndex}, updated_at = NOW()
          WHERE ${whereClause}
        `;
        params.push(img);

        const result = await client.query(updateQuery, params);
        
        if (result.rowCount > 0) {
          console.log(`✅ Updated ${result.rowCount} record(s) for project_id ${projectId}`);
          updated += result.rowCount;
        } else {
          console.log(`⚠️  No records found for project_id ${projectId}`);
          skipped++;
        }

      } catch (err) {
        console.error('❌ Error updating record:', err.message);
        errors++;
      }
    }

    console.log('\n📈 Update Summary:');
    console.log(`✅ Updated: ${updated} records`);
    console.log(`⚠️  Skipped: ${skipped} records`);
    console.log(`❌ Errors: ${errors} records`);

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const verificationQuery = `
      SELECT 
        project_id,
        unit_type,
        COUNT(*) as total_records,
        COUNT(img) as records_with_img,
        COUNT(*) FILTER (WHERE img IS NOT NULL) as updated_records
      FROM unit_availability 
      GROUP BY project_id, unit_type
      ORDER BY project_id, unit_type
    `;
    
    const verificationResult = await client.query(verificationQuery);
    console.log('📊 Verification Results:');
    verificationResult.rows.forEach(row => {
      console.log(`  Project ${row.project_id} - ${row.unit_type}: ${row.updated_records}/${row.total_records} updated`);
    });

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    if (client) {
      await client.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Check if CSV file path is provided
const csvFilePath = process.argv[2];
if (!csvFilePath) {
  console.log('❌ Please provide the CSV file path as an argument');
  console.log('Usage: node update-unit-availability-img.js <csv-file-path>');
console.log('Example: node update-unit-availability-img.js floor_plan.csv');
console.log('');
console.log('Expected CSV columns:');
console.log('  - projectName: Project name (must match existing project names)');
console.log('  - img: Image URL to set in unit_availability table');
console.log('  - unitType (optional): For more precise matching');
console.log('  - subtype (optional): For more precise matching');
  process.exit(1);
}

if (!fs.existsSync(csvFilePath)) {
  console.log(`❌ CSV file not found: ${csvFilePath}`);
  process.exit(1);
}

console.log(`🚀 Starting unit_availability img update from: ${csvFilePath}`);
updateUnitAvailabilityImg(csvFilePath); 