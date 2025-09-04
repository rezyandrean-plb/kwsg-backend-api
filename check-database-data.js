#!/usr/bin/env node

/**
 * Script to check what data exists in the database tables
 */

const knex = require('knex');

// Database configuration matching Strapi
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'kwpostgres',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
};

async function checkDatabaseData() {
  const db = knex(dbConfig);
  
  try {
    console.log('🔍 Checking database tables and data...\n');
    
    // Check projects table
    console.log('1. Projects table:');
    const projects = await db('projects').select('id', 'name', 'project_name').limit(3);
    console.log(`   Found ${projects.length} projects:`);
    projects.forEach(p => console.log(`   - ID: ${p.id}, Name: "${p.name}", Project Name: "${p.project_name || 'N/A'}"`));
    
    // Check floor_plans table
    console.log('\n2. Floor plans table:');
    try {
      const floorPlansCount = await db('floor_plans').count('* as total').first();
      console.log(`   Total floor plans: ${floorPlansCount.total}`);
      
      const floorPlans = await db('floor_plans').select('project_name').limit(5);
      console.log('   Sample project names:');
      floorPlans.forEach(fp => console.log(`   - "${fp.project_name}"`));
      
      // Check if "Brighthill Residences" exists
      const brighthillPlans = await db('floor_plans').where('project_name', 'Brighthill Residences').count('* as total').first();
      console.log(`   Floor plans for "Brighthill Residences": ${brighthillPlans.total}`);
      
    } catch (err) {
      console.log(`   ❌ Error accessing floor_plans table: ${err.message}`);
    }
    
    // Check unit_pricing table
    console.log('\n3. Unit pricing table:');
    try {
      const unitPricingCount = await db('unit_pricing').count('* as total').first();
      console.log(`   Total unit pricing records: ${unitPricingCount.total}`);
      
      if (unitPricingCount.total > 0) {
        const unitPricing = await db('unit_pricing').select('project_name', 'unit_type', 'min_price').limit(5);
        console.log('   Sample records:');
        unitPricing.forEach(up => console.log(`   - Project: "${up.project_name}", Type: ${up.unit_type}, Price: ${up.min_price}`));
        
        // Check if "Brighthill Residences" exists
        const brighthillPricing = await db('unit_pricing').where('project_name', 'Brighthill Residences').count('* as total').first();
        console.log(`   Unit pricing for "Brighthill Residences": ${brighthillPricing.total}`);
      }
      
    } catch (err) {
      console.log(`   ❌ Error accessing unit_pricing table: ${err.message}`);
    }
    
    // Check site_plans table
    console.log('\n4. Site plans table:');
    try {
      const sitePlansCount = await db('site_plans').count('* as total').first();
      console.log(`   Total site plans: ${sitePlansCount.total}`);
      
      if (sitePlansCount.total > 0) {
        const sitePlans = await db('site_plans').select('project_name', 'project_id').limit(5);
        console.log('   Sample records:');
        sitePlans.forEach(sp => console.log(`   - Project: "${sp.project_name}", Project ID: ${sp.project_id}`));
      }
      
    } catch (err) {
      console.log(`   ❌ Error accessing site_plans table: ${err.message}`);
    }
    
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  } finally {
    await db.destroy();
  }
}

checkDatabaseData();
