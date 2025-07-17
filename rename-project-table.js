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

async function renameProjectTable() {
  try {
    console.log('Renaming project table to projects...');
    
    // Check if projects table already exists
    const projectsExists = await knex.schema.hasTable('projects');
    if (projectsExists) {
      console.log('projects table already exists, skipping rename');
      return;
    }
    
    // Check if project table exists
    const projectExists = await knex.schema.hasTable('project');
    if (!projectExists) {
      console.log('project table does not exist');
      return;
    }
    
    // Rename the table
    await knex.raw('ALTER TABLE project RENAME TO projects');
    console.log('Successfully renamed project table to projects');
    
    // Verify the rename
    const newTableExists = await knex.schema.hasTable('projects');
    console.log('projects table now exists:', newTableExists);
    
  } catch (error) {
    console.error('Error renaming table:', error);
  } finally {
    await knex.destroy();
  }
}

renameProjectTable(); 