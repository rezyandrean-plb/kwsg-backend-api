/**
 * Migration to change latitude and longitude fields from decimal to string type
 */

exports.up = async function(knex) {
  console.log('🔄 Starting migration: Change latitude and longitude to string type');
  
  try {
    // Step 1: Add new string columns
    await knex.schema.alterTable('projects', function(table) {
      table.string('latitude_new');
      table.string('longitude_new');
    });
    
    console.log('✅ Added new string columns for latitude and longitude');
    
    // Step 2: Copy data from old columns to new columns (converting to string)
    await knex.raw(`
      UPDATE projects 
      SET 
        latitude_new = CASE 
          WHEN latitude IS NOT NULL THEN CAST(latitude AS TEXT)
          ELSE NULL 
        END,
        longitude_new = CASE 
          WHEN longitude IS NOT NULL THEN CAST(longitude AS TEXT)
          ELSE NULL 
        END
    `);
    
    console.log('✅ Copied and converted latitude/longitude data to string format');
    
    // Step 3: Drop old columns
    await knex.schema.alterTable('projects', function(table) {
      table.dropColumn('latitude');
      table.dropColumn('longitude');
    });
    
    console.log('✅ Dropped old decimal columns');
    
    // Step 4: Rename new columns to original names
    await knex.schema.alterTable('projects', function(table) {
      table.renameColumn('latitude_new', 'latitude');
      table.renameColumn('longitude_new', 'longitude');
    });
    
    console.log('✅ Renamed new columns to original names');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

exports.down = async function(knex) {
  console.log('🔄 Rolling back migration: Revert latitude and longitude to decimal type');
  
  try {
    // Step 1: Add new decimal columns
    await knex.schema.alterTable('projects', function(table) {
      table.decimal('latitude_old', 10, 8);
      table.decimal('longitude_old', 11, 8);
    });
    
    // Step 2: Copy data from string columns to decimal columns
    await knex.raw(`
      UPDATE projects 
      SET 
        latitude_old = CASE 
          WHEN latitude IS NOT NULL AND latitude != '' THEN CAST(latitude AS DECIMAL(10,8))
          ELSE NULL 
        END,
        longitude_old = CASE 
          WHEN longitude IS NOT NULL AND longitude != '' THEN CAST(longitude AS DECIMAL(11,8))
          ELSE NULL 
        END
    `);
    
    // Step 3: Drop string columns
    await knex.schema.alterTable('projects', function(table) {
      table.dropColumn('latitude');
      table.dropColumn('longitude');
    });
    
    // Step 4: Rename decimal columns to original names
    await knex.schema.alterTable('projects', function(table) {
      table.renameColumn('latitude_old', 'latitude');
      table.renameColumn('longitude_old', 'longitude');
    });
    
    console.log('✅ Rollback completed successfully!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};
