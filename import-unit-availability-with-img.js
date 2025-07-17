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

async function importUnitAvailabilityFromCSV(csvFilePath) {
  let client = null;
  try {
    client = new Client(dbConfig);
    await client.connect();

    const results = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', (error) => reject(error));
    });

    let imported = 0, skipped = 0, errors = 0;
    for (const record of results) {
      try {
        // Adjust these field names to match your CSV columns
        const {
          project_id,
          unit_type,
          subtype,
          size,
          price,
          total_units,
          available_units,
          status_percentage,
          img // <-- This is the image URL from your CSV
        } = record;

        if (!project_id || !unit_type) {
          console.log('Skipping record: missing project_id or unit_type');
          skipped++;
          continue;
        }

        await client.query(
          `INSERT INTO unit_availability
            (project_id, unit_type, subtype, size, price, total_units, available_units, status_percentage, img, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
           ON CONFLICT (project_id, unit_type, subtype) DO UPDATE
           SET size = EXCLUDED.size, price = EXCLUDED.price, total_units = EXCLUDED.total_units,
               available_units = EXCLUDED.available_units, status_percentage = EXCLUDED.status_percentage, img = EXCLUDED.img, updated_at = NOW()`,
          [project_id, unit_type, subtype, size, price, total_units, available_units, status_percentage, img]
        );
        imported++;
      } catch (err) {
        console.error('Error importing record:', err.message);
        errors++;
      }
    }
    console.log(`Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (client) await client.end();
  }
}

// Usage: node import-unit-availability-with-img.js floor_plan.csv
const csvFilePath = process.argv[2] || 'floor_plan.csv';
if (!fs.existsSync(csvFilePath)) {
  console.log('CSV file not found:', csvFilePath);
  process.exit(1);
}
importUnitAvailabilityFromCSV(csvFilePath); 