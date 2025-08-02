const knex = require('knex');

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

async function testProjectsTable() {
  console.log('🔍 Testing /api/projects database table...\n');
  
  try {
    const db = knex(dbConfig);
    console.log('✅ Database connection established');
    
    // Check both table names
    const projectsExists = await db.schema.hasTable('projects');
    const projectExists = await db.schema.hasTable('project');
    
    console.log(`📋 Table "projects" (plural) exists: ${projectsExists}`);
    console.log(`📋 Table "project" (singular) exists: ${projectExists}`);
    
    if (projectExists) {
      const count = await db('project').count('* as total');
      console.log(`📊 Records in "project" table: ${count[0].total}`);
      
      const sample = await db('project').select('id', 'name', 'location').limit(1);
      if (sample.length > 0) {
        console.log(`📄 Sample record: ID=${sample[0].id}, Name="${sample[0].name}", Location="${sample[0].location}"`);
      }
    }
    
    await db.destroy();
    
    console.log('\n📊 SUMMARY:');
    console.log('   The /api/projects endpoint should use the "project" table (singular)');
    console.log('   but the controller code is trying to query "projects" table (plural)');
    console.log('   This is causing the mismatch issue.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProjectsTable(); 