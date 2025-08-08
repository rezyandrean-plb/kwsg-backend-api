'use strict';

/**
 * Migration to fix the project_documents_idx index issue
 * This handles the case where the index already exists but Strapi tries to create it again
 * Handles both 'project' and 'projects' tables
 */

module.exports = {
  async up(knex) {
    console.log('Running migration: fix_project_documents_index');
    
    try {
      // Check both 'project' and 'projects' tables
      const tables = ['project', 'projects'];
      
      for (const tableName of tables) {
        console.log(`Checking table: ${tableName}`);
        
        // Check if the table exists
        const tableExists = await knex.raw(`
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = '${tableName}' 
          AND table_schema = 'public'
        `);
        
        if (tableExists.rows.length === 0) {
          console.log(`Table '${tableName}' does not exist, skipping...`);
          continue;
        }
        
        // Check if the index exists on this table
        const indexExists = await knex.raw(`
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'project_documents_idx' 
          AND tablename = '${tableName}'
        `);
        
        if (indexExists.rows.length > 0) {
          console.log(`Index project_documents_idx exists on table '${tableName}', dropping it...`);
          
          // Drop the existing index
          await knex.raw(`DROP INDEX IF EXISTS project_documents_idx`);
          console.log(`Dropped existing project_documents_idx index from '${tableName}'`);
        }
        
        // Check if the required columns exist on this table
        const columnsExist = await knex.raw(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          AND column_name IN ('document_id', 'locale', 'published_at')
        `);
        
        const existingColumns = columnsExist.rows.map(row => row.column_name);
        console.log(`Existing columns on '${tableName}':`, existingColumns);
        
        // Only create the index if all required columns exist
        if (existingColumns.includes('document_id') && 
            existingColumns.includes('locale') && 
            existingColumns.includes('published_at')) {
          
          console.log(`Creating project_documents_idx index on '${tableName}'...`);
          await knex.raw(`
            CREATE INDEX project_documents_idx 
            ON ${tableName} (document_id, locale, published_at)
          `);
          console.log(`Successfully created project_documents_idx index on '${tableName}'`);
        } else {
          console.log(`Required columns (document_id, locale, published_at) not found on '${tableName}', skipping index creation`);
        }
      }
      
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(knex) {
    console.log('Rolling back migration: fix_project_documents_index');
    
    try {
      // Drop the index from both tables if they exist
      const tables = ['project', 'projects'];
      
      for (const tableName of tables) {
        await knex.raw(`DROP INDEX IF EXISTS project_documents_idx`);
        console.log(`Dropped project_documents_idx index from '${tableName}'`);
      }
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
};
