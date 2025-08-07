const axios = require('axios');

const API_BASE_URL = 'http://localhost:1337/api';

async function testProjectDetailsComprehensive() {
  console.log('🧪 Testing Project Details API - Comprehensive Test');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get all projects to find an existing ID
    console.log('\n1️⃣ Getting all projects...');
    const allProjectsResponse = await axios.get(`${API_BASE_URL}/projects`);
    const projects = allProjectsResponse.data.data;
    
    if (projects.length === 0) {
      console.log('❌ No projects found. Cannot test project details API.');
      return;
    }
    
    const testProjectId = projects[0].id;
    console.log(`✅ Found project with ID: ${testProjectId}`);
    console.log(`📋 Project name: ${projects[0].attributes?.name || 'No name'}`);
    
    // Step 2: Test project details with all populate options
    console.log('\n2️⃣ Testing project details with all related data...');
    console.log('🔗 Testing: GET /projects/:id?populate=*');
    
    const populateResponse = await axios.get(`${API_BASE_URL}/projects/${testProjectId}?populate=*`);
    
    if (populateResponse.status === 200) {
      console.log('✅ Status: 200 OK');
      
      const project = populateResponse.data.data;
      const attributes = project.attributes;
      
      console.log('\n📊 Project Details:');
      console.log(`   🏠 Name: ${attributes?.name || 'N/A'}`);
      console.log(`   📍 Location: ${attributes?.location || 'N/A'}`);
      console.log(`   💰 Price From: ${attributes?.price_from || 'N/A'}`);
      console.log(`   🏢 Developer: ${attributes?.developer || 'N/A'}`);
      console.log(`   📅 Completion: ${attributes?.completion || 'N/A'}`);
      
      // Check for related data
      console.log('\n🔗 Related Data:');
      
      // Unit Pricing
      if (attributes?.unit_pricing?.data) {
        const unitPricing = attributes.unit_pricing.data;
        console.log(`   💵 Unit Pricing: ${Array.isArray(unitPricing) ? unitPricing.length : 1} record(s)`);
        if (Array.isArray(unitPricing) && unitPricing.length > 0) {
          console.log(`      Sample: ${unitPricing[0].attributes?.unit_type || 'N/A'} - ${unitPricing[0].attributes?.price_from || 'N/A'}`);
        }
      } else {
        console.log('   💵 Unit Pricing: No data found');
      }
      
      // Floor Plans
      if (attributes?.floor_plans?.data) {
        const floorPlans = attributes.floor_plans.data;
        console.log(`   🏗️  Floor Plans: ${Array.isArray(floorPlans) ? floorPlans.length : 1} record(s)`);
        if (Array.isArray(floorPlans) && floorPlans.length > 0) {
          console.log(`      Sample: ${floorPlans[0].attributes?.floor_plan_name || 'N/A'}`);
        }
      } else {
        console.log('   🏗️  Floor Plans: No data found');
      }
      
      // Site Plans
      if (attributes?.site_plans?.data) {
        const sitePlans = attributes.site_plans.data;
        console.log(`   🗺️  Site Plans: ${Array.isArray(sitePlans) ? sitePlans.length : 1} record(s)`);
        if (Array.isArray(sitePlans) && sitePlans.length > 0) {
          console.log(`      Sample: ${sitePlans[0].attributes?.site_plan_name || 'N/A'}`);
        }
      } else {
        console.log('   🗺️  Site Plans: No data found');
      }
      
      // Brochures
      if (attributes?.brochures?.data) {
        const brochures = attributes.brochures.data;
        console.log(`   📄 Brochures: ${Array.isArray(brochures) ? brochures.length : 1} record(s)`);
        if (Array.isArray(brochures) && brochures.length > 0) {
          console.log(`      Sample: ${brochures[0].attributes?.brochure_title || 'N/A'}`);
        }
      } else {
        console.log('   📄 Brochures: No data found');
      }
      
      // Show all available attributes
      console.log('\n📋 All Available Attributes:');
      const availableAttrs = Object.keys(attributes || {}).filter(key => !key.includes('data'));
      console.log(`   ${availableAttrs.join(', ')}`);
      
      // Show all available relations
      console.log('\n🔗 All Available Relations:');
      const availableRelations = Object.keys(attributes || {}).filter(key => key.includes('data'));
      console.log(`   ${availableRelations.join(', ')}`);
      
    } else {
      console.log(`❌ Unexpected status: ${populateResponse.status}`);
    }
    
    // Step 3: Test specific populate options
    console.log('\n3️⃣ Testing specific populate options...');
    
    const specificPopulateResponse = await axios.get(
      `${API_BASE_URL}/projects/${testProjectId}?populate[unit_pricing]=*&populate[floor_plans]=*&populate[site_plans]=*&populate[brochures]=*`
    );
    
    if (specificPopulateResponse.status === 200) {
      console.log('✅ Specific populate: 200 OK');
      const specificProject = specificPopulateResponse.data.data;
      console.log(`📊 Project: ${specificProject.attributes?.name || 'N/A'}`);
    } else {
      console.log(`❌ Specific populate failed: ${specificPopulateResponse.status}`);
    }
    
    // Step 4: Test without populate
    console.log('\n4️⃣ Testing without populate (basic data only)...');
    
    const basicResponse = await axios.get(`${API_BASE_URL}/projects/${testProjectId}`);
    
    if (basicResponse.status === 200) {
      console.log('✅ Basic request: 200 OK');
      const basicProject = basicResponse.data.data;
      console.log(`📊 Project: ${basicProject.attributes?.name || 'N/A'}`);
      console.log(`📍 Location: ${basicProject.attributes?.location || 'N/A'}`);
    } else {
      console.log(`❌ Basic request failed: ${basicResponse.status}`);
    }
    
    console.log('\n🎉 Comprehensive Project Details Test Complete!');
    
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log(`📄 Response data:`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProjectDetailsComprehensive();
