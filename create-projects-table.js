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

async function createProjectsTable() {
  try {
    console.log('Creating projects table from project table...');
    
    // Check if projects table already exists
    const projectsExists = await knex.schema.hasTable('projects');
    if (projectsExists) {
      console.log('projects table already exists');
      return;
    }
    
    // Check if project table exists
    const projectExists = await knex.schema.hasTable('project');
    if (!projectExists) {
      console.log('project table does not exist');
      return;
    }
    
    // Get the structure of the project table
    const columns = await knex.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'project' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Creating projects table with same structure...');
    
    // Create projects table with the same structure
    await knex.schema.createTable('projects', (table) => {
      columns.rows.forEach(col => {
        if (col.column_name === 'id') {
          table.increments('id').primary();
        } else {
          // Map data types appropriately
          if (col.data_type === 'character varying') {
            table.string(col.column_name);
          } else if (col.data_type === 'text') {
            table.text(col.column_name);
          } else if (col.data_type === 'integer') {
            table.integer(col.column_name);
          } else if (col.data_type === 'timestamp with time zone') {
            table.timestamp(col.column_name);
          } else if (col.data_type === 'boolean') {
            table.boolean(col.column_name);
          } else {
            table.string(col.column_name);
          }
        }
      });
    });
    
    console.log('Copying data from project to projects...');
    
    // Copy all data from project to projects
    await knex.raw('INSERT INTO projects SELECT * FROM project');
    
    console.log('Successfully created projects table and copied data');
    
    // Verify
    const count = await knex('projects').count('* as total');
    console.log('Total projects in new table:', count[0].total);
    
  } catch (error) {
    console.error('Error creating projects table:', error);
  } finally {
    await knex.destroy();
  }
}

createProjectsTable(); 