#!/usr/bin/env node

/**
 * Test script to verify enhanced unit pricing with floor plan images
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:1337';

async function testEnhancedUnitPricing() {
  try {
    console.log('🧪 Testing Enhanced Unit Pricing with Floor Plan Images...\n');
    
    // Test with Normanton Park (ID: 394) which has both unit pricing and floor plans
    const projectId = 394;
    const projectName = "Normanton Park";
    
    console.log(`Testing with project: ${projectName} (ID: ${projectId})\n`);
    
    // Get detailed project information
    console.log('1. Fetching project details...');
    const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}`);
    const projectData = response.data.data;
    
    console.log(`✅ Project: ${projectData.name}`);
    console.log(`   Unit pricing records: ${projectData.unitPricing?.length || 0}`);
    console.log(`   Floor plans records: ${projectData.floorPlans?.length || 0}\n`);
    
    // Check unit pricing with floor plan images
    console.log('2. Checking enhanced unit pricing data...');
    const unitPricing = projectData.unitPricing || [];
    
    if (unitPricing.length > 0) {
      console.log('✅ Enhanced unit pricing data found:');
      
      unitPricing.slice(0, 5).forEach((pricing, index) => {
        console.log(`\n   ${index + 1}. ${pricing.unit_type}`);
        console.log(`      Price: ${pricing.price_range} ${pricing.currency}`);
        console.log(`      Floor Plan Image: ${pricing.floor_plan_image ? '✅' : '❌'}`);
        if (pricing.floor_plan_image) {
          console.log(`      Image URL: ${pricing.floor_plan_image}`);
        }
        console.log(`      Floor Plan ID: ${pricing.floor_plan_id || 'N/A'}`);
        console.log(`      Floor Plan Name: ${pricing.floor_plan_name || 'N/A'}`);
      });
      
      // Count how many unit pricing records have floor plan images
      const withImages = unitPricing.filter(p => p.floor_plan_image).length;
      const withoutImages = unitPricing.length - withImages;
      
      console.log(`\n📊 Summary:`);
      console.log(`   Total unit pricing records: ${unitPricing.length}`);
      console.log(`   With floor plan images: ${withImages}`);
      console.log(`   Without floor plan images: ${withoutImages}`);
      console.log(`   Match rate: ${((withImages / unitPricing.length) * 100).toFixed(1)}%`);
      
    } else {
      console.log('❌ No unit pricing data found');
    }
    
    // Check floor plans data for comparison
    console.log('\n3. Checking floor plans data for comparison...');
    const floorPlans = projectData.floorPlans || [];
    
    if (floorPlans.length > 0) {
      console.log('✅ Floor plans data found:');
      
      // Get unique floor plan types
      const uniqueTypes = [...new Set(floorPlans.map(fp => fp.floor_plan_type).filter(Boolean))];
      console.log(`   Unique floor plan types: ${uniqueTypes.length}`);
      uniqueTypes.slice(0, 5).forEach(type => console.log(`   - ${type}`));
      
      // Get unique unit types from unit pricing
      const uniqueUnitTypes = [...new Set(unitPricing.map(up => up.unit_type).filter(Boolean))];
      console.log(`\n   Unique unit pricing types: ${uniqueUnitTypes.length}`);
      uniqueUnitTypes.slice(0, 5).forEach(type => console.log(`   - ${type}`));
      
    } else {
      console.log('❌ No floor plans data found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testEnhancedUnitPricing();
