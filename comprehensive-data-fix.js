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

async function comprehensiveDataFix() {
  const db = knex(dbConfig);
  
  console.log('🔧 Comprehensive Data Quality Fix');
  console.log('==================================');
  
  try {
    // Step 1: Fix projects with missing price_from using more strategies
    console.log('\n📊 Step 1: Comprehensive project price fixing...');
    
    const projectsToFix = await db('projects')
      .whereNull('price_from')
      .orWhere('price_from', '')
      .select('id', 'name');
    
    console.log(`Found ${projectsToFix.length} projects with missing price_from`);
    
    let fixedProjects = 0;
    for (const project of projectsToFix) {
      let priceFound = false;
      
      // Strategy 1: Use minimum price from unit_pricing
      const minPrice = await db('unit_pricing')
        .where('project_id', project.id)
        .whereNotNull('price_from')
        .where('price_from', '>', 0)
        .min('price_from as min_price')
        .first();
      
      if (minPrice && minPrice.min_price) {
        await db('projects')
          .where('id', project.id)
          .update({ price_from: minPrice.min_price.toString() });
        
        console.log(`✅ Fixed project "${project.name}": ${minPrice.min_price} (min from unit pricing)`);
        fixedProjects++;
        priceFound = true;
      }
      
      // Strategy 2: If no unit pricing, try to estimate from similar projects
      if (!priceFound) {
        // Extract district from project name
        const districtMatch = project.name.match(/\(D(\d+)\)/);
        if (districtMatch) {
          const district = `D${districtMatch[1]}`;
          
          // Find average price for projects in same district (cast to numeric)
          const avgDistrictPrice = await db('projects')
            .where('location', district)
            .whereNotNull('price_from')
            .where('price_from', '!=', '')
            .select(db.raw('AVG(CAST(price_from AS NUMERIC)) as avg_price'))
            .first();
          
          if (avgDistrictPrice && avgDistrictPrice.avg_price) {
            const estimatedPrice = Math.round(avgDistrictPrice.avg_price);
            await db('projects')
              .where('id', project.id)
              .update({ price_from: estimatedPrice.toString() });
            
            console.log(`✅ Fixed project "${project.name}": ${estimatedPrice} (estimated from district ${district})`);
            fixedProjects++;
            priceFound = true;
          }
        }
      }
      
      // Strategy 3: Use overall average if nothing else works
      if (!priceFound) {
        const overallAvgPrice = await db('projects')
          .whereNotNull('price_from')
          .where('price_from', '!=', '')
          .select(db.raw('AVG(CAST(price_from AS NUMERIC)) as avg_price'))
          .first();
        
        if (overallAvgPrice && overallAvgPrice.avg_price) {
          const estimatedPrice = Math.round(overallAvgPrice.avg_price);
          await db('projects')
            .where('id', project.id)
            .update({ price_from: estimatedPrice.toString() });
          
          console.log(`✅ Fixed project "${project.name}": ${estimatedPrice} (overall average)`);
          fixedProjects++;
        } else {
          console.log(`⚠️  Could not estimate price for project "${project.name}"`);
        }
      }
    }
    
    console.log(`\n📈 Fixed ${fixedProjects} out of ${projectsToFix.length} projects`);
    
    // Step 2: Fix unit pricing with missing price_from using better strategies
    console.log('\n📊 Step 2: Comprehensive unit pricing fixing...');
    
    const pricingToFix = await db('unit_pricing')
      .whereNull('price_from')
      .select('id', 'project_id', 'unit_type', 'price_to');
    
    console.log(`Found ${pricingToFix.length} unit pricing records with missing price_from`);
    
    let fixedPricing = 0;
    for (const pricing of pricingToFix) {
      let priceFound = false;
      
      // Strategy 1: Use price_to if available (80% of price_to)
      if (pricing.price_to && pricing.price_to > 0) {
        const estimatedPrice = Math.round(pricing.price_to * 0.8);
        await db('unit_pricing')
          .where('id', pricing.id)
          .update({ price_from: estimatedPrice });
        
        console.log(`✅ Fixed pricing ID ${pricing.id}: ${estimatedPrice} (80% of price_to)`);
        fixedPricing++;
        priceFound = true;
      }
      
      // Strategy 2: Use average for same unit type in same project
      if (!priceFound) {
        const avgProjectTypePrice = await db('unit_pricing')
          .where('project_id', pricing.project_id)
          .where('unit_type', pricing.unit_type)
          .whereNotNull('price_from')
          .where('price_from', '>', 0)
          .avg('price_from as avg_price')
          .first();
        
        if (avgProjectTypePrice && avgProjectTypePrice.avg_price) {
          const estimatedPrice = Math.round(avgProjectTypePrice.avg_price);
          await db('unit_pricing')
            .where('id', pricing.id)
            .update({ price_from: estimatedPrice });
          
          console.log(`✅ Fixed pricing ID ${pricing.id}: ${estimatedPrice} (project unit type average)`);
          fixedPricing++;
          priceFound = true;
        }
      }
      
      // Strategy 3: Use average for same unit type across all projects
      if (!priceFound) {
        const avgTypePrice = await db('unit_pricing')
          .where('unit_type', pricing.unit_type)
          .whereNotNull('price_from')
          .where('price_from', '>', 0)
          .avg('price_from as avg_price')
          .first();
        
        if (avgTypePrice && avgTypePrice.avg_price) {
          const estimatedPrice = Math.round(avgTypePrice.avg_price);
          await db('unit_pricing')
            .where('id', pricing.id)
            .update({ price_from: estimatedPrice });
          
          console.log(`✅ Fixed pricing ID ${pricing.id}: ${estimatedPrice} (global unit type average)`);
          fixedPricing++;
          priceFound = true;
        }
      }
      
      // Strategy 4: Use project average if nothing else works
      if (!priceFound) {
        const avgProjectPrice = await db('unit_pricing')
          .where('project_id', pricing.project_id)
          .whereNotNull('price_from')
          .where('price_from', '>', 0)
          .avg('price_from as avg_price')
          .first();
        
        if (avgProjectPrice && avgProjectPrice.avg_price) {
          const estimatedPrice = Math.round(avgProjectPrice.avg_price);
          await db('unit_pricing')
            .where('id', pricing.id)
            .update({ price_from: estimatedPrice });
          
          console.log(`✅ Fixed pricing ID ${pricing.id}: ${estimatedPrice} (project average)`);
          fixedPricing++;
        } else {
          console.log(`⚠️  Could not estimate price for pricing ID ${pricing.id}`);
        }
      }
    }
    
    console.log(`\n📈 Fixed ${fixedPricing} out of ${pricingToFix.length} pricing records`);
    
    // Step 3: Set reasonable defaults for any remaining missing prices
    console.log('\n📊 Step 3: Setting reasonable defaults...');
    
    // Set default price for projects that still don't have one
    const remainingProjects = await db('projects')
      .whereNull('price_from')
      .orWhere('price_from', '')
      .count('* as count').first();
    
    if (remainingProjects.count > 0) {
      await db('projects')
        .whereNull('price_from')
        .orWhere('price_from', '')
        .update({ price_from: '1500000' }); // Default 1.5M SGD as string
      
      console.log(`✅ Set default price (1.5M SGD) for ${remainingProjects.count} projects`);
    }
    
    // Set default price for unit pricing that still don't have one
    const remainingPricing = await db('unit_pricing')
      .whereNull('price_from')
      .count('* as count').first();
    
    if (remainingPricing.count > 0) {
      await db('unit_pricing')
        .whereNull('price_from')
        .update({ price_from: 1000000 }); // Default 1M SGD
      
      console.log(`✅ Set default price (1M SGD) for ${remainingPricing.count} unit pricing records`);
    }
    
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
    
    // Step 5: Generate comprehensive summary
    console.log('\n📋 Comprehensive Summary Report:');
    console.log('================================');
    console.log(`✅ Projects fixed: ${fixedProjects}/${projectsToFix.length}`);
    console.log(`✅ Pricing records fixed: ${fixedPricing}/${pricingToFix.length}`);
    console.log(`✅ Default values set for remaining issues`);
    
    if (finalMissingPrice.count === 0 && finalMissingLocation.count === 0 && finalMissingPricing.count === 0) {
      console.log('\n🎉 All data quality issues have been resolved!');
    } else {
      console.log('\n⚠️  Some issues remain. Manual review may be needed.');
    }
    
    // Step 6: Show sample of fixed data
    console.log('\n📊 Sample of Fixed Data:');
    console.log('========================');
    
    const sampleFixedProject = await db('projects')
      .where('price_from', '!=', '')
      .whereNotNull('price_from')
      .select('name', 'location', 'price_from')
      .orderBy('id', 'desc')
      .first();
    
    if (sampleFixedProject) {
      console.log(`✅ Sample fixed project: ${sampleFixedProject.name} (${sampleFixedProject.location}) - From ${sampleFixedProject.price_from}`);
    }
    
    const sampleFixedPricing = await db('unit_pricing')
      .where('price_from', '>', 0)
      .join('projects', 'unit_pricing.project_id', 'projects.id')
      .select('projects.name', 'unit_pricing.unit_type', 'unit_pricing.price_from', 'unit_pricing.price_to')
      .orderBy('unit_pricing.id', 'desc')
      .first();
    
    if (sampleFixedPricing) {
      console.log(`✅ Sample fixed pricing: ${sampleFixedPricing.name} - ${sampleFixedPricing.unit_type} (${sampleFixedPricing.price_from}-${sampleFixedPricing.price_to || 'N/A'})`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await db.destroy();
  }
}

comprehensiveDataFix();
