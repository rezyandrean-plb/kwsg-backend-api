'use strict';

/**
 * Migration to create brochures table
 */

module.exports = {
  async up(knex) {
    // Check if table already exists
    const tableExists = await knex.schema.hasTable('brochures');
    if (tableExists) {
      console.log('brochures table already exists, skipping creation');
      return;
    }
    
    await knex.schema.createTable('brochures', (table) => {
      table.increments('id').primary();
      table.string('project_name').notNullable();
      table.string('brochure_url').notNullable();
      table.string('brochure_title');
      table.text('description');
      table.string('file_type').defaultTo('pdf');
      table.integer('file_size');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      
      // Add indexes for better performance
      table.index('project_name');
      table.index('is_active');
    });
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('brochures');
  }
}; 