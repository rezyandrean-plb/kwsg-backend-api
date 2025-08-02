const knex = require('knex');

// Database configuration - you may need to adjust these values
const dbConfig = {
  client: 'postgresql', // or 'mysql' or 'sqlite3' depending on your setup
  connection: {
    host: process.env.DATABASE_HOST || 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: process.env.DATABASE_PORT || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'kwpostgres',
    database: process.env.DATABASE_NAME || 'postgres',
    ssl: { rejectUnauthorized: false }
  },
};

async function testProjectsTable() {
  console.log('🔍 Testing which table /api/projects endpoint uses...\n');
  
  try {
    // Create database connection
    const db = knex(dbConfig);
    console.log('✅ Database connection established');
    
    // Test 1: Check if 'projects' table exists
    console.log('\n📋 Test 1: Checking if "projects" table exists...');
    const tableExists = await db.schema.hasTable('projects');
    console.log(`   Table "projects" exists: ${tableExists}`);
    
    if (projectTableExists) {
      // Test 2: Get table structure
      console.log('\n📋 Test 2: Getting "project" table structure...');
      const columns = await db('project').columnInfo();
      console.log('   Columns in project table:');
      Object.keys(columns).forEach(col => {
        console.log(`   - ${col}: ${columns[col].type}`);
      });
      
      // Test 3: Count records
      console.log('\n📋 Test 3: Counting records in "project" table...');
      const count = await db('project').count('* as total');
      console.log(`   Total records: ${count[0].total}`);
      
      // Test 4: Get sample data
      console.log('\n📋 Test 4: Getting sample data from "project" table...');
      const sampleData = await db('project').select('*').limit(3);
      console.log('   Sample records:');
      sampleData.forEach((record, index) => {
        console.log(`   Record ${index + 1}:`);
        console.log(`     ID: ${record.id}`);
        console.log(`     Name: ${record.name}`);
        console.log(`     Location: ${record.location}`);
        console.log(`     Developer: ${record.developer}`);
        console.log(`     Created: ${record.created_at}`);
        console.log('');
      });
    }
    
    // Test 5: Check for other potential project-related tables
    console.log('\n📋 Test 5: Checking for other project-related tables...');
    const allTables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%project%'
      ORDER BY table_name
    `);
    
    console.log('   Project-related tables found:');
    allTables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    if (projectTableExists) {
      const projectColumns = await db('project').columnInfo();
      console.log('   Columns in project table:');
      Object.keys(projectColumns).forEach(col => {
        console.log(`   - ${col}: ${projectColumns[col].type}`);
      });
    }
    
    // Test 7: Check Strapi's core tables
    console.log('\n📋 Test 7: Checking Strapi core tables...');
    const strapiTables = ['components', 'content_types', 'files', 'migrations', 'permissions', 'roles', 'users'];
    
    for (const table of strapiTables) {
      const exists = await db.schema.hasTable(table);
      console.log(`   Table "${table}" exists: ${exists}`);
    }
    
    console.log('\n✅ Database testing completed successfully!');
    console.log('\n📊 SUMMARY:');
    console.log(`   - Main projects table: ${tableExists ? 'projects' : 'NOT FOUND'}`);
    console.log(`   - Singular project table: ${projectTableExists ? 'project' : 'NOT FOUND'}`);
    console.log(`   - Total project-related tables: ${allTables.rows.length}`);
    
    if (projectTableExists) {
      console.log(`   - Records in project table: ${count[0].total}`);
    }
    
    await db.destroy();
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Try alternative database configurations
    console.log('\n🔄 Trying alternative database configurations...');
    
    const alternativeConfigs = [
      {
        client: 'mysql',
        connection: {
          host: process.env.DATABASE_HOST || 'localhost',
          port: process.env.DATABASE_PORT || 3306,
          user: process.env.DATABASE_USERNAME || 'root',
          password: process.env.DATABASE_PASSWORD || '',
          database: process.env.DATABASE_NAME || 'strapi',
        },
      },
      {
        client: 'sqlite3',
        connection: {
          filename: './database/data.db',
        },
      },
    ];
    
    for (const config of alternativeConfigs) {
      try {
        console.log(`\n🔄 Trying ${config.client}...`);
        const altDb = knex(config);
        await altDb.raw('SELECT 1');
        console.log(`✅ ${config.client} connection successful`);
        
        const tableExists = await altDb.schema.hasTable('projects');
        console.log(`   Table "projects" exists: ${tableExists}`);
        
        await altDb.destroy();
        break;
      } catch (altError) {
        console.log(`❌ ${config.client} failed: ${altError.message}`);
      }
    }
  }
}

// Run the test
testProjectsTable().then(() => {
  console.log('\n🏁 Test script completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Test script failed:', error);
  process.exit(1);
}); 