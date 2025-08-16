'use strict';

/**
 * Migration to create image_galleries table
 */

module.exports = {
  async up(knex) {
    await knex.schema.createTable('image_galleries', (table) => {
      table.increments('id').primary();
      table.string('project_name').notNullable().comment('References the project name for relation');
      table.string('image_title').notNullable();
      table.string('image_url').notNullable();
      table.text('image_description');
      table.string('image_category').comment('Category of the image (e.g., exterior, interior, amenities, etc.)');
      table.integer('display_order').defaultTo(0).comment('Order for displaying images');
      table.boolean('is_featured').defaultTo(false).comment('Whether this image should be featured');
      table.string('alt_text').comment('Alt text for accessibility');
      table.string('image_size').comment('Size information of the image');
      table.boolean('is_active').defaultTo(true).comment('Whether this image is active and should be displayed');
      table.timestamps(true, true);
      
      // Add indexes for better performance
      table.index('project_name');
      table.index('image_category');
      table.index('is_featured');
      table.index('is_active');
      table.index('display_order');
    });
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('image_galleries');
  }
};
