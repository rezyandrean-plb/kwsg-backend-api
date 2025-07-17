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

async function testUnitAvailability() {
  try {
    console.log('Testing unit_availability table structure...');
    
    // Check if unit_availability table exists
    const tableExists = await knex.schema.hasTable('unit_availability');
    console.log('unit_availability table exists:', tableExists);
    
    if (tableExists) {
      // Get table structure
      const columns = await knex.raw(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'unit_availability' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      console.log('unit_availability table columns:', columns.rows);
      
      // Check if there's any data
      const count = await knex('unit_availability').count('* as total');
      console.log('Total unit_availability records:', count[0].total);
      
      if (count[0].total > 0) {
        const firstRecord = await knex('unit_availability').first();
        console.log('First unit_availability record:', firstRecord);
        
        // Check if img field exists in the data
        const hasImgField = 'img' in firstRecord;
        console.log('Has img field:', hasImgField);
        
        if (hasImgField) {
          console.log('img field value:', firstRecord.img);
        }
        
        // Check how many records have img data
        const recordsWithImg = await knex('unit_availability')
          .whereNotNull('img')
          .count('* as total');
        console.log('Records with img data:', recordsWithImg[0].total);
      }
      
      // Check for project 60 specifically
      const project60Units = await knex('unit_availability')
        .where('project_id', 60)
        .select('*');
      console.log('Unit availability for project 60:', project60Units.length, 'records');
      
      if (project60Units.length > 0) {
        console.log('Sample unit availability for project 60:', project60Units[0]);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await knex.destroy();
  }
}

testUnitAvailability(); 