const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    database: 'kwsg',
    user: 'postgres',
    password: 'kwpostgres',
    ssl: { rejectUnauthorized: false }
  }
});

const migration = require('./database/migrations/004_add_img_to_unit_availability.js');

async function runMigration() {
  try {
    console.log('Running unit_availability migration...');
    await migration.up(knex);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await knex.destroy();
  }
}

runMigration(); 