'use strict';

/**
 * Migration to create press_articles table
 */

module.exports = {
  async up(knex) {
    await knex.schema.createTable('press_articles', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.string('imageUrl').notNullable();
      table.string('link').notNullable();
      table.date('date').notNullable();
      table.string('year').notNullable();
      table.string('source').notNullable();
      table.string('slug').unique();
      table.text('articleContent');
      table.timestamps(true, true);
      
      // Add indexes for better performance
      table.index('date');
      table.index('year');
      table.index('source');
      table.index('slug');
    });
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('press_articles');
  }
}; 