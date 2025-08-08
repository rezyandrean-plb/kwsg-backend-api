'use strict';

/**
 * Migration to fix press_articles table schema mismatch
 * This handles the case where Strapi tries to add columns that already exist
 */

module.exports = {
  async up(knex) {
    console.log('Running migration: fix_press_articles_schema');
    
    try {
      // Check if the press_articles table exists
      const tableExists = await knex.raw(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'press_articles' 
        AND table_schema = 'public'
      `);
      
      if (tableExists.rows.length === 0) {
        console.log('press_articles table does not exist, skipping...');
        return;
      }
      
      // Get current columns
      const columns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'press_articles' 
        AND table_schema = 'public'
      `);
      
      const existingColumns = columns.rows.map(col => col.column_name);
      console.log('Existing columns:', existingColumns);
      
      // Define the columns that Strapi expects
      const expectedColumns = [
        'document_id', 'title', 'description', 'image_url', 'link', 
        'date', 'year', 'source', 'slug', 'article_content', 
        'published_at', 'created_by_id', 'updated_by_id', 'locale'
      ];
      
      // Check which columns are missing
      const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('Missing columns:', missingColumns);
        
        // Add missing columns one by one
        for (const column of missingColumns) {
          try {
            console.log(`Adding column: ${column}`);
            
            // Determine column type based on the column name
            let columnType = 'varchar(255)';
            if (column === 'description' || column === 'article_content') {
              columnType = 'text';
            } else if (column === 'date') {
              columnType = 'date';
            } else if (column === 'published_at') {
              columnType = 'timestamp(6)';
            } else if (column === 'created_by_id' || column === 'updated_by_id') {
              columnType = 'integer';
            }
            
            await knex.raw(`ALTER TABLE press_articles ADD COLUMN IF NOT EXISTS ${column} ${columnType}`);
            console.log(`✅ Added column: ${column}`);
          } catch (error) {
            console.log(`⚠️  Could not add column ${column}:`, error.message);
          }
        }
      } else {
        console.log('✅ All expected columns already exist');
      }
      
      // Check for duplicate columns (like imageUrl vs image_url)
      const duplicateColumns = ['imageUrl', 'articleContent'];
      for (const column of duplicateColumns) {
        if (existingColumns.includes(column)) {
          console.log(`⚠️  Found duplicate column: ${column}, consider removing it`);
        }
      }
      
      console.log('✅ Press articles schema migration completed');
      
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(knex) {
    console.log('Rolling back migration: fix_press_articles_schema');
    
    try {
      // This migration only adds columns, so rolling back would remove them
      // But since the columns might contain data, we'll just log this
      console.log('⚠️  Rolling back would remove columns. Skipping rollback to preserve data.');
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
};
