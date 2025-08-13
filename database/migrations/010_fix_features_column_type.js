'use strict';

/**
 * Migration to fix the features column type from text[] to jsonb
 * This handles the conversion of existing array data to JSON format
 */

module.exports = {
  async up(knex) {
    console.log('Starting features column type fix migration...');
    
    try {
      // First, let's check the current state of the features column
      const columnInfo = await knex.raw(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'features'
      `);
      
      console.log('Current features column info:', columnInfo.rows[0]);
      
      // Check if there's existing data that needs conversion
      const existingData = await knex('projects')
        .select('id', 'features')
        .whereNotNull('features')
        .limit(5);
      
      console.log('Sample existing features data:', existingData);
      
      // Step 1: Create a temporary column with jsonb type
      await knex.schema.alterTable('projects', (table) => {
        table.jsonb('features_temp');
      });
      
      console.log('Created temporary features_temp column');
      
      // Step 2: Convert existing data from text[] to jsonb
      // Handle different data formats that might exist
      await knex.raw(`
        UPDATE projects 
        SET features_temp = CASE 
          WHEN features IS NULL THEN NULL
          WHEN features = '{}' THEN '[]'::jsonb
          WHEN features::text LIKE '[%]' THEN features::text::jsonb
          ELSE jsonb_build_array(features::text)
        END
        WHERE features IS NOT NULL
      `);
      
      console.log('Converted existing features data to JSON format');
      
      // Step 3: Drop the old column
      await knex.schema.alterTable('projects', (table) => {
        table.dropColumn('features');
      });
      
      console.log('Dropped old features column');
      
      // Step 4: Rename the temporary column to features
      await knex.schema.alterTable('projects', (table) => {
        table.renameColumn('features_temp', 'features');
      });
      
      console.log('Renamed features_temp to features');
      
      // Step 5: Add a default value for new records
      await knex.raw(`
        ALTER TABLE projects 
        ALTER COLUMN features SET DEFAULT '[]'::jsonb
      `);
      
      console.log('Set default value for features column');
      
      // Verify the migration
      const finalColumnInfo = await knex.raw(`
        SELECT column_name, data_type, udt_name, column_default
        FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'features'
      `);
      
      console.log('Final features column info:', finalColumnInfo.rows[0]);
      
      console.log('Features column type fix migration completed successfully');
      
    } catch (error) {
      console.error('Error in features column migration:', error);
      throw error;
    }
  },

  async down(knex) {
    console.log('Rolling back features column type fix...');
    
    try {
      // This is a destructive migration, so we'll recreate the original structure
      // Note: This will lose any JSON data and convert back to text array
      
      // Create temporary column
      await knex.schema.alterTable('projects', (table) => {
        table.specificType('features_old', 'text[]');
      });
      
      // Convert JSON data back to text array (this will be lossy)
      await knex.raw(`
        UPDATE projects 
        SET features_old = CASE 
          WHEN features IS NULL THEN NULL
          WHEN features = '[]'::jsonb THEN '{}'
          ELSE ARRAY(SELECT jsonb_array_elements_text(features))
        END
        WHERE features IS NOT NULL
      `);
      
      // Drop the jsonb column
      await knex.schema.alterTable('projects', (table) => {
        table.dropColumn('features');
      });
      
      // Rename back
      await knex.schema.alterTable('projects', (table) => {
        table.renameColumn('features_old', 'features');
      });
      
      console.log('Features column rollback completed');
      
    } catch (error) {
      console.error('Error in features column rollback:', error);
      throw error;
    }
  }
};
