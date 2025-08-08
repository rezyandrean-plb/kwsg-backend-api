'use strict';

/**
 * Migration to fix the project_documents_idx index issue
 * This handles the case where the index already exists but Strapi tries to create it again
 */

module.exports = {
  async up(knex) {
    console.log('Running migration: fix_project_documents_index');
    
    try {
      // Check if the index exists
      const indexExists = await knex.raw(`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'project_documents_idx' 
        AND tablename = 'projects'
      `);
      
      if (indexExists.rows.length > 0) {
        console.log('Index project_documents_idx already exists, dropping it...');
        
        // Drop the existing index
        await knex.raw('DROP INDEX IF EXISTS project_documents_idx');
        console.log('Dropped existing project_documents_idx index');
      }
      
      // Check if the required columns exist
      const columnsExist = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name IN ('document_id', 'locale', 'published_at')
      `);
      
      const existingColumns = columnsExist.rows.map(row => row.column_name);
      console.log('Existing columns:', existingColumns);
      
      // Only create the index if all required columns exist
      if (existingColumns.includes('document_id') && 
          existingColumns.includes('locale') && 
          existingColumns.includes('published_at')) {
        
        console.log('Creating project_documents_idx index...');
        await knex.raw(`
          CREATE INDEX project_documents_idx 
          ON projects (document_id, locale, published_at)
        `);
        console.log('Successfully created project_documents_idx index');
      } else {
        console.log('Required columns (document_id, locale, published_at) not found, skipping index creation');
      }
      
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(knex) {
    console.log('Rolling back migration: fix_project_documents_index');
    
    try {
      // Drop the index if it exists
      await knex.raw('DROP INDEX IF EXISTS project_documents_idx');
      console.log('Dropped project_documents_idx index');
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
};
