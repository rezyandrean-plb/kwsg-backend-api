// Test using the exact same connection as Strapi
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

async function testStrapiConnection() {
  try {
    console.log('Testing connection with exact same config as Strapi...');
    
    // Test basic connection
    const result = await knex.raw('SELECT current_database(), current_user, current_schema()');
    console.log('Connected to:', result.rows[0]);
    
    // List ALL tables in ALL schemas
    const allTables = await knex('information_schema.tables')
      .select('table_schema', 'table_name')
      .where('table_schema', 'in', ['public', 'information_schema', 'pg_catalog'])
      .orderBy(['table_schema', 'table_name']);
    
    console.log('\nAll tables in public schema:');
    allTables.filter(t => t.table_schema === 'public').forEach(t => {
      console.log(`- ${t.table_name}`);
    });
    
    // Specifically check for projects table
    const projectsExists = await knex.schema.hasTable('projects');
    console.log('\nprojects table exists:', projectsExists);
    
    if (projectsExists) {
      const count = await knex('projects').count('* as total');
      console.log('projects table has', count[0].total, 'records');
    }
    
    // Check for project (singular) table
    const projectExists = await knex.schema.hasTable('project');
    console.log('project (singular) table exists:', projectExists);
    
    if (projectExists) {
      const count = await knex('project').count('* as total');
      console.log('project table has', count[0].total, 'records');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await knex.destroy();
  }
}

testStrapiConnection(); 