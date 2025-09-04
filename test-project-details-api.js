#!/usr/bin/env node

/**
 * Test script to verify the project details API is working correctly
 * This script tests the unit pricing and floor plans data retrieval
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:1337';

async function testProjectDetailsAPI() {
  try {
    console.log('🧪 Testing Project Details API...\n');
    
    // Test 1: Get all projects to find a project ID
    console.log('1. Fetching projects list...');
    const projectsResponse = await axios.get(`${API_BASE_URL}/api/projects`);
    const projects = projectsResponse.data.data;
    
    if (projects.length === 0) {
      console.log('❌ No projects found in the database');
      return;
    }
    
    // Test with Normanton Park (ID: 394) which we know has both unit pricing and floor plans
    const testProject = { id: 394, name: "Normanton Park" };
    
    console.log(`✅ Found ${projects.length} projects`);
    console.log(`   Testing with project: ${testProject.name} (ID: ${testProject.id})\n`);
    
    // Test 2: Get detailed project information
    console.log('2. Fetching detailed project information...');
    const projectDetailsResponse = await axios.get(`${API_BASE_URL}/api/projects/${testProject.id}`);
    const projectDetails = projectDetailsResponse.data.data;
    
    console.log('✅ Project details retrieved successfully');
    console.log(`   Project: ${projectDetails.name}`);
    console.log(`   Location: ${projectDetails.location}`);
    console.log(`   Developer: ${projectDetails.developer?.name || 'N/A'}`);
    
    // Test 3: Check unit pricing data
    console.log('\n3. Checking unit pricing data...');
    const unitPricing = projectDetails.unitPricing || [];
    console.log(`   Unit pricing records: ${unitPricing.length}`);
    
    if (unitPricing.length > 0) {
      console.log('   ✅ Unit pricing data found:');
      unitPricing.slice(0, 3).forEach((pricing, index) => {
        console.log(`      ${index + 1}. ${pricing.unit_type} - ${pricing.price_range || pricing.price} ${pricing.currency || 'SGD'}`);
      });
    } else {
      console.log('   ⚠️  No unit pricing data found');
    }
    
    // Test 4: Check floor plans data
    console.log('\n4. Checking floor plans data...');
    const floorPlans = projectDetails.floorPlans || [];
    console.log(`   Floor plans records: ${floorPlans.length}`);
    
    if (floorPlans.length > 0) {
      console.log('   ✅ Floor plans data found:');
      floorPlans.slice(0, 3).forEach((plan, index) => {
        console.log(`      ${index + 1}. ${plan.floor_plan_name || plan.unit_type} - ${plan.bedrooms}BR/${plan.bathrooms}BA`);
        console.log(`         Image: ${plan.image_url ? '✅' : '❌'}`);
      });
    } else {
      console.log('   ⚠️  No floor plans data found');
    }
    
    // Test 5: Check other related data
    console.log('\n5. Checking other related data...');
    console.log(`   Images: ${projectDetails.images?.length || 0}`);
    console.log(`   Facilities: ${projectDetails.facilities?.length || 0}`);
    console.log(`   Features: ${projectDetails.features?.length || 0}`);
    console.log(`   Brochures: ${projectDetails.brochures?.length || 0}`);
    console.log(`   Image Gallery: ${projectDetails.imageGallery?.length || 0}`);
    console.log(`   Site Plans: ${projectDetails.sitePlans?.length || 0}`);
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Project details API is working`);
    console.log(`   ${unitPricing.length > 0 ? '✅' : '⚠️ '} Unit pricing: ${unitPricing.length} records`);
    console.log(`   ${floorPlans.length > 0 ? '✅' : '⚠️ '} Floor plans: ${floorPlans.length} records`);
    
    if (unitPricing.length === 0 && floorPlans.length === 0) {
      console.log('\n💡 Recommendations:');
      console.log('   - Check if unit_pricing and floor_plans tables have data');
      console.log('   - Verify project_id and project_name relationships');
      console.log('   - Check database connection and table structure');
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
testProjectDetailsAPI();
