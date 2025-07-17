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

async function testFloorPlans() {
  try {
    console.log('Testing floor plans for project 60...');
    
    // Get project details
    const project = await knex('projects').where('id', 60).first();
    console.log('Project:', { id: project.id, name: project.name, project_name: project.project_name });
    
    // Check floor plans by project_id
    const floorPlansById = await knex('floor_plans')
      .where('project_id', 60)
      .where('is_available', true)
      .select('*');
    console.log('Floor plans by project_id:', floorPlansById.length);
    
    // Check floor plans by project_name
    const floorPlansByName = await knex('floor_plans')
      .where('project_name', project.name)
      .where('is_available', true)
      .select('*');
    console.log('Floor plans by project_name:', floorPlansByName.length);
    
    // Check floor plans by project_name (using project_name field)
    const floorPlansByProjectName = await knex('floor_plans')
      .where('project_name', project.project_name)
      .where('is_available', true)
      .select('*');
    console.log('Floor plans by project_name field:', floorPlansByProjectName.length);
    
    // Show sample floor plans
    if (floorPlansById.length > 0) {
      console.log('Sample floor plan by ID:', floorPlansById[0]);
    }
    if (floorPlansByName.length > 0) {
      console.log('Sample floor plan by name:', floorPlansByName[0]);
    }
    if (floorPlansByProjectName.length > 0) {
      console.log('Sample floor plan by project_name:', floorPlansByProjectName[0]);
    }
    
    // Check all floor plans structure
    const allFloorPlans = await knex('floor_plans').select('*').limit(3);
    console.log('Sample floor plans structure:', allFloorPlans[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await knex.destroy();
  }
}

testFloorPlans(); 