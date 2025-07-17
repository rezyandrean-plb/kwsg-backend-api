const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'kwpostgres',
    ssl: { rejectUnauthorized: false }
  }
});

async function checkProjectsTable() {
  try {
    console.log('Checking projects table specifically...');
    
    // Check if projects table exists
    const projectsExists = await knex.schema.hasTable('projects');
    console.log('projects table exists:', projectsExists);
    
    if (projectsExists) {
      // Get table structure
      const columns = await knex.raw(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      console.log('projects table columns:', columns.rows);
      
      // Check if there's any data
      const count = await knex('projects').count('* as total');
      console.log('Total projects:', count[0].total);
      
      if (count[0].total > 0) {
        const firstProject = await knex('projects').first();
        console.log('First project:', firstProject);
      }
    } else {
      console.log('projects table does NOT exist');
    }
    
    // Also check for project (singular) table
    const projectExists = await knex.schema.hasTable('project');
    console.log('project (singular) table exists:', projectExists);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await knex.destroy();
  }
}

checkProjectsTable(); 