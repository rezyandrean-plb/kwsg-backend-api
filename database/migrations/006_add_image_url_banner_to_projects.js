const knex = require('knex');

/**
 * Migration to add image_url_banner column to projects table
 */
async function up(knex) {
  try {
    console.log('Adding image_url_banner column to projects table...');
    
    // Check if column already exists
    const hasColumn = await knex.schema.hasColumn('projects', 'image_url_banner');
    
    if (!hasColumn) {
      await knex.schema.table('projects', (table) => {
        table.string('image_url_banner').nullable();
      });
      
      console.log('✅ Successfully added image_url_banner column to projects table');
    } else {
      console.log('ℹ️  image_url_banner column already exists in projects table');
    }
    
  } catch (error) {
    console.error('❌ Error adding image_url_banner column:', error);
    throw error;
  }
}

/**
 * Rollback migration
 */
async function down(knex) {
  try {
    console.log('Removing image_url_banner column from projects table...');
    
    const hasColumn = await knex.schema.hasColumn('projects', 'image_url_banner');
    
    if (hasColumn) {
      await knex.schema.table('projects', (table) => {
        table.dropColumn('image_url_banner');
      });
      
      console.log('✅ Successfully removed image_url_banner column from projects table');
    } else {
      console.log('ℹ️  image_url_banner column does not exist in projects table');
    }
    
  } catch (error) {
    console.error('❌ Error removing image_url_banner column:', error);
    throw error;
  }
}

module.exports = { up, down }; 