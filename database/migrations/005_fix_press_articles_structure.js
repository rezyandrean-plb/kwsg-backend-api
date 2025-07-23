'use strict';

/**
 * Migration to fix press_articles table structure for Strapi compatibility
 */

module.exports = {
  async up(knex) {
    // Check if table exists
    const tableExists = await knex.schema.hasTable('press_articles');
    if (!tableExists) {
      console.log('press_articles table does not exist, creating it with Strapi structure');
      await knex.schema.createTable('press_articles', (table) => {
        table.increments('id').primary();
        table.jsonb('data');
        table.timestamps(true, true);
      });
      return;
    }

    // Check if data column already exists
    const hasDataColumn = await knex.schema.hasColumn('press_articles', 'data');
    if (hasDataColumn) {
      console.log('data column already exists in press_articles table');
      return;
    }

    // Backup existing data
    const existingData = await knex('press_articles').select('*');
    
    // Drop the existing table
    await knex.schema.dropTable('press_articles');
    
    // Create new table with Strapi structure
    await knex.schema.createTable('press_articles', (table) => {
      table.increments('id').primary();
      table.jsonb('data');
      table.timestamps(true, true);
    });

    // Restore data in Strapi format
    for (const row of existingData) {
      const strapiData = {
        title: row.title,
        description: row.description,
        imageUrl: row.imageUrl,
        link: row.link,
        date: row.date,
        year: row.year,
        source: row.source,
        slug: row.slug,
        articleContent: row.articleContent,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
      
      await knex('press_articles').insert({
        id: row.id,
        data: strapiData,
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    }
  },

  async down(knex) {
    // This migration cannot be safely reversed as it restructures the table
    console.log('This migration cannot be safely reversed');
  }
}; 