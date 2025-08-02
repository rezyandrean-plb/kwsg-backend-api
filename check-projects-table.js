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

async function checkProjectsTable() {
  console.log('🔍 Checking projects table properly...\n');
  
  try {
    const db = knex(dbConfig);
    console.log('✅ Database connection established');
    
    // List all tables to see what's actually there
    console.log('📋 All tables in database:');
    const allTables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    allTables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check both table names
    const projectsExists = await db.schema.hasTable('projects');
    const projectExists = await db.schema.hasTable('project');
    
    console.log(`\n📋 Table "projects" (plural) exists: ${projectsExists}`);
    console.log(`📋 Table "project" (singular) exists: ${projectExists}`);
    
    // If projects table exists, check its data
    if (projectsExists) {
      const count = await db('projects').count('* as total');
      console.log(`📊 Records in "projects" table: ${count[0].total}`);
      
      if (count[0].total > 0) {
        const sample = await db('projects').select('id', 'name', 'location').limit(3);
        console.log('📄 Sample records from projects table:');
        sample.forEach((record, index) => {
          console.log(`   ${index + 1}. ID=${record.id}, Name="${record.name}", Location="${record.location}"`);
        });
      }
    }
    
    // If project table exists, check its data too
    if (projectExists) {
      const count = await db('project').count('* as total');
      console.log(`📊 Records in "project" table: ${count[0].total}`);
      
      if (count[0].total > 0) {
        const sample = await db('project').select('id', 'name', 'location').limit(3);
        console.log('📄 Sample records from project table:');
        sample.forEach((record, index) => {
          console.log(`   ${index + 1}. ID=${record.id}, Name="${record.name}", Location="${record.location}"`);
        });
      }
    }
    
    await db.destroy();
    
    console.log('\n📊 SUMMARY:');
    if (projectsExists) {
      console.log('   ✅ The "projects" table exists and should be used by the API');
    } else {
      console.log('   ❌ The "projects" table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProjectsTable(); 