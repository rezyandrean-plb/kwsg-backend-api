'use strict';

/**
 * Migration to enhance floor_plans table with new fields
 */

module.exports = {
  async up(knex) {
    // Check if table already exists
    const tableExists = await knex.schema.hasTable('floor_plans');
    if (!tableExists) {
      console.log('floor_plans table does not exist, creating it...');
      
      await knex.schema.createTable('floor_plans', (table) => {
        table.increments('id').primary();
        table.integer('project_id'); // Keep for backward compatibility
        table.string('project_name'); // New field for project name linking
        table.string('floor_plan_id'); // New field from CSV
        table.string('floor_plan_type'); // New field from CSV
        table.string('floor_plan_name'); // New field from CSV
        table.string('img'); // New field from CSV
        table.string('unit_type');
        table.string('bedrooms');
        table.string('bathrooms');
        table.decimal('size_sqft', 10, 2);
        table.string('price');
        table.string('floor_plan_image');
        table.text('description');
        table.boolean('is_available').defaultTo(true);
        table.timestamps(true, true);
        
        // Add indexes for better performance
        table.index('project_id');
        table.index('project_name');
        table.index('floor_plan_id');
        table.index('is_available');
      });
    } else {
      console.log('floor_plans table exists, adding new columns...');
      
      // Add new columns if they don't exist
      const columns = await knex.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'floor_plans' 
        AND table_schema = 'public'
      `);
      
      const existingColumns = columns.rows.map(row => row.column_name);
      
      if (!existingColumns.includes('project_name')) {
        await knex.schema.alterTable('floor_plans', (table) => {
          table.string('project_name');
        });
        console.log('Added project_name column');
      }
      
      if (!existingColumns.includes('floor_plan_id')) {
        await knex.schema.alterTable('floor_plans', (table) => {
          table.string('floor_plan_id');
        });
        console.log('Added floor_plan_id column');
      }
      
      if (!existingColumns.includes('floor_plan_type')) {
        await knex.schema.alterTable('floor_plans', (table) => {
          table.string('floor_plan_type');
        });
        console.log('Added floor_plan_type column');
      }
      
      if (!existingColumns.includes('floor_plan_name')) {
        await knex.schema.alterTable('floor_plans', (table) => {
          table.string('floor_plan_name');
        });
        console.log('Added floor_plan_name column');
      }
      
      if (!existingColumns.includes('img')) {
        await knex.schema.alterTable('floor_plans', (table) => {
          table.string('img');
        });
        console.log('Added img column');
      }
      
      // Add indexes for new columns
      await knex.raw('CREATE INDEX IF NOT EXISTS idx_floor_plans_project_name ON floor_plans(project_name)');
      await knex.raw('CREATE INDEX IF NOT EXISTS idx_floor_plans_floor_plan_id ON floor_plans(floor_plan_id)');
    }
  },

  async down(knex) {
    // Remove the new columns (be careful with this in production)
    const tableExists = await knex.schema.hasTable('floor_plans');
    if (tableExists) {
      await knex.schema.alterTable('floor_plans', (table) => {
        table.dropColumn('project_name');
        table.dropColumn('floor_plan_id');
        table.dropColumn('floor_plan_type');
        table.dropColumn('floor_plan_name');
        table.dropColumn('img');
      });
    }
  }
}; 