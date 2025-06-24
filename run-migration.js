const knex = require('knex');

// This script should be run when Strapi is running
// You can run it with: node run-migration.js

async function runMigration() {
  try {
    // Connect to the database using the same configuration as Strapi
    const db = knex({
      client: 'postgresql',
      connection: process.env.DATABASE_URL || 'postgresql://localhost:5432/strapi',
    });

    console.log('Running migration to make projects fields nullable...');

    // Run the migration SQL
    await db.raw(`
      ALTER TABLE projects 
      ALTER COLUMN project_name DROP NOT NULL,
      ALTER COLUMN title DROP NOT NULL,
      ALTER COLUMN location DROP NOT NULL,
      ALTER COLUMN address DROP NOT NULL,
      ALTER COLUMN type DROP NOT NULL,
      ALTER COLUMN price DROP NOT NULL,
      ALTER COLUMN bedrooms DROP NOT NULL,
      ALTER COLUMN bathrooms DROP NOT NULL,
      ALTER COLUMN size DROP NOT NULL,
      ALTER COLUMN units DROP NOT NULL,
      ALTER COLUMN developer DROP NOT NULL,
      ALTER COLUMN completion DROP NOT NULL,
      ALTER COLUMN description DROP NOT NULL,
      ALTER COLUMN district DROP NOT NULL,
      ALTER COLUMN tenure DROP NOT NULL,
      ALTER COLUMN property_type DROP NOT NULL,
      ALTER COLUMN status DROP NOT NULL,
      ALTER COLUMN total_units DROP NOT NULL,
      ALTER COLUMN total_floors DROP NOT NULL,
      ALTER COLUMN site_area DROP NOT NULL,
      ALTER COLUMN latitude DROP NOT NULL,
      ALTER COLUMN longitude DROP NOT NULL;
    `);

    console.log('Migration completed successfully!');
    console.log('All fields except name and slug are now nullable.');

    await db.destroy();
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration(); 