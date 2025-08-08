const knex = require('knex');

/**
 * Script to cleanup the problematic 'project' table
 * This removes the Strapi default 'project' table that's causing index conflicts
 */

async function cleanupProjectTable() {
  console.log('🧹 Cleaning up project table...');
  
  const db = knex({
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
      port: process.env.DATABASE_PORT || 5432,
      user: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'kwpostgres',
      database: process.env.DATABASE_NAME || 'kwsg',
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 1,
      max: 10,
    }
  });

  try {
    // Check if the 'project' table exists
    console.log('📋 Checking if project table exists...');
    const tableExists = await db.raw(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'project' 
      AND table_schema = 'public'
    `);
    
    if (tableExists.rows.length === 0) {
      console.log('ℹ️  Table project does not exist, nothing to clean up');
      return;
    }
    
    // Check if the table has any data
    console.log('📊 Checking if project table has data...');
    const dataCount = await db.raw('SELECT COUNT(*) as count FROM project');
    const count = parseInt(dataCount.rows[0].count);
    
    if (count > 0) {
      console.log(`⚠️  Table project has ${count} records. Are you sure you want to delete it?`);
      console.log('💡 This table appears to be Strapi\'s default table, not your custom projects table');
      console.log('🔍 Your actual data is in the projects table (plural)');
    }
    
    // Drop all indexes on the project table
    console.log('🗑️  Dropping indexes on project table...');
    const indexes = await db.raw(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'project' 
      AND indexname != 'project_pkey'
    `);
    
    for (const row of indexes.rows) {
      console.log(`🗑️  Dropping index: ${row.indexname}`);
      await db.raw(`DROP INDEX IF EXISTS ${row.indexname}`);
    }
    
    // Drop the project table
    console.log('🗑️  Dropping project table...');
    await db.raw('DROP TABLE IF EXISTS project CASCADE');
    console.log('✅ Dropped project table');
    
    // Verify the projects table (plural) still exists and has data
    console.log('✅ Verifying projects table (plural) is intact...');
    const projectsCount = await db.raw('SELECT COUNT(*) as count FROM projects');
    console.log(`📊 Projects table has ${projectsCount.rows[0].count} records`);
    
    console.log('🎉 Cleanup completed successfully!');
    console.log('💡 Strapi will now use the projects table (plural) for all operations');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupProjectTable()
    .then(() => {
      console.log('✅ Cleanup script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupProjectTable };
