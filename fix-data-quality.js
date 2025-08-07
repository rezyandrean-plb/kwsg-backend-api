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

async function fixDataQuality() {
  const db = knex(dbConfig);
  
  console.log('🔧 Data Quality Fix Script');
  console.log('==========================');
  
  try {
    // Step 1: Fix projects with missing price_from by using unit_pricing data
    console.log('\n📊 Step 1: Fixing projects with missing price_from...');
    
    const projectsToFix = await db('projects')
      .whereNull('price_from')
      .orWhere('price_from', '')
      .select('id', 'name');
    
    console.log(`Found ${projectsToFix.length} projects with missing price_from`);
    
    let fixedProjects = 0;
    for (const project of projectsToFix) {
      // Find the minimum price_from from unit_pricing for this project
      const minPrice = await db('unit_pricing')
        .where('project_id', project.id)
        .whereNotNull('price_from')
        .where('price_from', '>', 0)
        .min('price_from as min_price')
        .first();
      
      if (minPrice && minPrice.min_price) {
        await db('projects')
          .where('id', project.id)
          .update({ price_from: minPrice.min_price });
        
        console.log(`✅ Fixed project "${project.name}": ${minPrice.min_price}`);
        fixedProjects++;
      } else {
        console.log(`⚠️  No valid pricing found for project "${project.name}"`);
      }
    }
    
    console.log(`\n📈 Fixed ${fixedProjects} out of ${projectsToFix.length} projects`);
    
    // Step 2: Fix unit pricing with missing price_from
    console.log('\n📊 Step 2: Fixing unit pricing with missing price_from...');
    
    const pricingToFix = await db('unit_pricing')
      .whereNull('price_from')
      .select('id', 'project_id', 'unit_type', 'price_to');
    
    console.log(`Found ${pricingToFix.length} unit pricing records with missing price_from`);
    
    let fixedPricing = 0;
    for (const pricing of pricingToFix) {
      // Try to estimate price_from based on price_to or project average
      let estimatedPrice = null;
      
      if (pricing.price_to && pricing.price_to > 0) {
        // Use 80% of price_to as a reasonable estimate
        estimatedPrice = Math.round(pricing.price_to * 0.8);
      } else {
        // Get average price for this project and unit type
        const avgPrice = await db('unit_pricing')
          .where('project_id', pricing.project_id)
          .where('unit_type', pricing.unit_type)
          .whereNotNull('price_from')
          .where('price_from', '>', 0)
          .avg('price_from as avg_price')
          .first();
        
        if (avgPrice && avgPrice.avg_price) {
          estimatedPrice = Math.round(avgPrice.avg_price);
        }
      }
      
      if (estimatedPrice) {
        await db('unit_pricing')
          .where('id', pricing.id)
          .update({ price_from: estimatedPrice });
        
        console.log(`✅ Fixed pricing ID ${pricing.id}: ${estimatedPrice}`);
        fixedPricing++;
      } else {
        console.log(`⚠️  Could not estimate price for pricing ID ${pricing.id}`);
      }
    }
    
    console.log(`\n📈 Fixed ${fixedPricing} out of ${pricingToFix.length} pricing records`);
    
    // Step 3: Fix projects with missing location
    console.log('\n📊 Step 3: Fixing projects with missing location...');
    
    const locationToFix = await db('projects')
      .whereNull('location')
      .orWhere('location', '')
      .select('id', 'name');
    
    console.log(`Found ${locationToFix.length} projects with missing location`);
    
    // Try to extract location from project name or set default
    let fixedLocations = 0;
    for (const project of locationToFix) {
      // Try to extract district from project name (e.g., "Project Name (D20)" -> "D20")
      const districtMatch = project.name.match(/\(D(\d+)\)/);
      if (districtMatch) {
        const location = `D${districtMatch[1]}`;
        await db('projects')
          .where('id', project.id)
          .update({ location });
        
        console.log(`✅ Fixed location for "${project.name}": ${location}`);
        fixedLocations++;
      } else {
        // Set a default location
        await db('projects')
          .where('id', project.id)
          .update({ location: 'Singapore' });
        
        console.log(`✅ Set default location for "${project.name}": Singapore`);
        fixedLocations++;
      }
    }
    
    console.log(`\n📈 Fixed ${fixedLocations} out of ${locationToFix.length} location records`);
    
    // Step 4: Final verification
    console.log('\n🔍 Step 4: Final verification...');
    
    const finalMissingPrice = await db('projects')
      .whereNull('price_from')
      .orWhere('price_from', '')
      .count('* as count').first();
    
    const finalMissingLocation = await db('projects')
      .whereNull('location')
      .orWhere('location', '')
      .count('* as count').first();
    
    const finalMissingPricing = await db('unit_pricing')
      .whereNull('price_from')
      .count('* as count').first();
    
    console.log(`📊 Final status:`);
    console.log(`   - Projects missing price_from: ${finalMissingPrice.count}`);
    console.log(`   - Projects missing location: ${finalMissingLocation.count}`);
    console.log(`   - Unit pricing missing price_from: ${finalMissingPricing.count}`);
    
    // Step 5: Generate summary report
    console.log('\n📋 Summary Report:');
    console.log('==================');
    console.log(`✅ Projects fixed: ${fixedProjects}/${projectsToFix.length}`);
    console.log(`✅ Pricing records fixed: ${fixedPricing}/${pricingToFix.length}`);
    console.log(`✅ Locations fixed: ${fixedLocations}/${locationToFix.length}`);
    
    if (finalMissingPrice.count === 0 && finalMissingLocation.count === 0 && finalMissingPricing.count === 0) {
      console.log('\n🎉 All data quality issues have been resolved!');
    } else {
      console.log('\n⚠️  Some issues remain. Manual review may be needed.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await db.destroy();
  }
}

fixDataQuality();
