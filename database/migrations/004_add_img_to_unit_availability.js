'use strict';

/**
 * Migration to add img field to unit_availability table
 */

module.exports = {
  async up(knex) {
    // Check if table exists
    const tableExists = await knex.schema.hasTable('unit_availability');
    if (!tableExists) {
      console.log('unit_availability table does not exist, skipping');
      return;
    }
    
    // Check if img column already exists
    const columns = await knex.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'unit_availability' 
      AND table_schema = 'public'
    `);
    
    const existingColumns = columns.rows.map(row => row.column_name);
    
    if (!existingColumns.includes('img')) {
      console.log('Adding img column to unit_availability table...');
      await knex.schema.alterTable('unit_availability', (table) => {
        table.string('img');
      });
      console.log('✅ Added img column to unit_availability table');
    } else {
      console.log('img column already exists in unit_availability table');
    }
  },

  async down(knex) {
    // Remove the img column
    const tableExists = await knex.schema.hasTable('unit_availability');
    if (tableExists) {
      const columns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'unit_availability' 
        AND table_schema = 'public'
      `);
      
      const existingColumns = columns.rows.map(row => row.column_name);
      
      if (existingColumns.includes('img')) {
        await knex.schema.alterTable('unit_availability', (table) => {
          table.dropColumn('img');
        });
        console.log('Removed img column from unit_availability table');
      }
    }
  }
}; 