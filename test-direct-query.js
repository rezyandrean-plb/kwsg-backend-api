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

async function testDirectQuery() {
  try {
    console.log('Testing direct query to projects table...');
    
    // Test basic connection
    const result = await knex.raw('SELECT current_database(), current_user, current_schema()');
    console.log('Connected to:', result.rows[0]);
    
    // Try to query projects table directly
    const projects = await knex('projects').select('*').limit(5);
    console.log('First 5 projects:', projects);
    
    // Try to query with the same complex query as the controller
    const complexQuery = await knex('projects as p')
      .select('p.*')
      .limit(5);
    console.log('Complex query result:', complexQuery);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await knex.destroy();
  }
}

testDirectQuery(); 