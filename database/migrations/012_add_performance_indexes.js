'use strict';

/**
 * Migration to add performance indexes for better API response times
 */

module.exports = {
  async up(knex) {
    console.log('Running migration: add_performance_indexes');
    
    try {
      // Add indexes to projects table
      console.log('Adding indexes to projects table...');
      
      await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_projects_created_at 
        ON projects (created_at DESC)
      `);
      
      await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_projects_status 
        ON projects (status)
      `);
      
      await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_projects_location_lower 
        ON projects (LOWER(location))
      `);
      
      await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_projects_developer 
        ON projects (developer)
      `);
      
      await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_projects_slug 
        ON projects (slug)
      `);
      
      console.log('✅ Performance indexes created successfully');
      
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(knex) {
    console.log('Rolling back migration: add_performance_indexes');
    
    try {
      const indexes = [
        'idx_projects_created_at',
        'idx_projects_status',
        'idx_projects_location_lower',
        'idx_projects_developer',
        'idx_projects_slug'
      ];
      
      for (const indexName of indexes) {
        await knex.raw(`DROP INDEX IF EXISTS ${indexName}`);
      }
      
      console.log('✅ All performance indexes dropped successfully');
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
};
