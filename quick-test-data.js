const knex = require('knex');

// Database configuration
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

async function quickTest() {
  const db = knex(dbConfig);
  
  console.log('🧪 Enhanced Data Quality Test');
  console.log('=============================');
  
  try {
    // Test 1: Check projects count
    const projectsCount = await db('projects').count('* as count').first();
    console.log(`✅ Projects imported: ${projectsCount.count}`);
    
    // Test 2: Check unit pricing count
    const pricingCount = await db('unit_pricing').count('* as count').first();
    console.log(`✅ Unit pricing imported: ${pricingCount.count}`);
    
    // Test 3: Check linked data
    const linkedCount = await db('unit_pricing').whereNotNull('project_id').count('* as count').first();
    console.log(`✅ Linked unit pricing: ${linkedCount.count}`);
    
    // Test 4: Check floor plans count
    const floorPlansCount = await db('floor_plans').count('* as count').first();
    console.log(`✅ Floor plans imported: ${floorPlansCount.count}`);
    
    // Test 5: Check site plans count
    const sitePlansCount = await db('site_plans').count('* as count').first();
    console.log(`✅ Site plans imported: ${sitePlansCount.count}`);
    
    // Test 6: Check brochures count
    const brochuresCount = await db('brochures').count('* as count').first();
    console.log(`✅ Brochures imported: ${brochuresCount.count}`);
    
    // Data Quality Checks
    console.log('\n🔍 Data Quality Analysis:');
    console.log('========================');
    
    // Check for projects with missing price_from (handle both null and empty string)
    const missingPriceProjects = await db('projects')
      .whereNull('price_from')
      .orWhere('price_from', '')
      .count('* as count').first();
    console.log(`⚠️  Projects missing price_from: ${missingPriceProjects.count}`);
    
    // Check for projects with missing location
    const missingLocationProjects = await db('projects')
      .whereNull('location')
      .orWhere('location', '')
      .count('* as count').first();
    console.log(`⚠️  Projects missing location: ${missingLocationProjects.count}`);
    
    // Check for unit pricing with missing prices (handle numeric field properly)
    const missingPricing = await db('unit_pricing')
      .whereNull('price_from')
      .count('* as count').first();
    console.log(`⚠️  Unit pricing missing price_from: ${missingPricing.count}`);
    
    // Check for unit pricing with zero or negative prices
    const invalidPricing = await db('unit_pricing')
      .where('price_from', '<=', 0)
      .count('* as count').first();
    console.log(`⚠️  Unit pricing with invalid prices (≤0): ${invalidPricing.count}`);
    
    // Check for floor plans with missing project_id
    const unlinkedFloorPlans = await db('floor_plans')
      .whereNull('project_id')
      .count('* as count').first();
    console.log(`⚠️  Floor plans without project_id: ${unlinkedFloorPlans.count}`);
    
    // Check for site plans with missing project_id
    const unlinkedSitePlans = await db('site_plans')
      .whereNull('project_id')
      .count('* as count').first();
    console.log(`⚠️  Site plans without project_id: ${unlinkedSitePlans.count}`);
    
    // Sample data with better formatting
    console.log('\n📊 Sample Data:');
    console.log('===============');
    
    // Sample project data
    const sampleProject = await db('projects').select('id', 'name', 'location', 'price_from').first();
    console.log(`✅ Sample project: ${sampleProject.name} (${sampleProject.location || 'N/A'}) - From ${sampleProject.price_from || 'N/A'}`);
    
    // Sample unit pricing
    const samplePricing = await db('unit_pricing')
      .join('projects', 'unit_pricing.project_id', 'projects.id')
      .select('projects.name', 'unit_pricing.unit_type', 'unit_pricing.price_from', 'unit_pricing.price_to')
      .first();
    console.log(`✅ Sample pricing: ${samplePricing.name} - ${samplePricing.unit_type} (${samplePricing.price_from || 'N/A'}-${samplePricing.price_to || 'N/A'})`);
    
    // Sample floor plan
    const sampleFloorPlan = await db('floor_plans')
      .join('projects', 'floor_plans.project_id', 'projects.id')
      .select('projects.name', 'floor_plans.floor_plan_type', 'floor_plans.floor_plan_name')
      .first();
    console.log(`✅ Sample floor plan: ${sampleFloorPlan.name} - ${sampleFloorPlan.floor_plan_type} (${sampleFloorPlan.floor_plan_name})`);
    
    // Sample site plan
    const sampleSitePlan = await db('site_plans')
      .join('projects', 'site_plans.project_id', 'projects.id')
      .select('projects.name', 'site_plans.site_plan_name')
      .first();
    console.log(`✅ Sample site plan: ${sampleSitePlan.name} - ${sampleSitePlan.site_plan_name}`);
    
    // Sample brochure
    const sampleBrochure = await db('brochures')
      .join('projects', 'brochures.project_name', 'projects.name')
      .select('projects.name', 'brochures.brochure_title')
      .first();
    console.log(`✅ Sample brochure: ${sampleBrochure.name} - ${sampleBrochure.brochure_title}`);
    
    // Check for any orphaned records
    console.log('\n🔗 Relationship Checks:');
    console.log('======================');
    
    // Check unit pricing with invalid project_id
    const invalidPricingProject = await db('unit_pricing')
      .leftJoin('projects', 'unit_pricing.project_id', 'projects.id')
      .whereNull('projects.id')
      .count('unit_pricing.id as count').first();
    console.log(`⚠️  Unit pricing with invalid project_id: ${invalidPricingProject.count}`);
    
    // Check floor plans with invalid project_id
    const invalidFloorPlanProject = await db('floor_plans')
      .leftJoin('projects', 'floor_plans.project_id', 'projects.id')
      .whereNull('projects.id')
      .count('floor_plans.id as count').first();
    console.log(`⚠️  Floor plans with invalid project_id: ${invalidFloorPlanProject.count}`);
    
    // Check site plans with invalid project_id
    const invalidSitePlanProject = await db('site_plans')
      .leftJoin('projects', 'site_plans.project_id', 'projects.id')
      .whereNull('projects.id')
      .count('site_plans.id as count').first();
    console.log(`⚠️  Site plans with invalid project_id: ${invalidSitePlanProject.count}`);
    
    console.log('\n🎉 Enhanced data verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await db.destroy();
  }
}

quickTest();
