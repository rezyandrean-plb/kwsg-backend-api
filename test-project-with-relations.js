const axios = require('axios');

const API_BASE_URL = 'http://localhost:1337/api';

async function testProjectWithRelations() {
  console.log('🧪 Testing Project with Relations');
  console.log('=' .repeat(40));
  
  try {
    // Get a project that should have related data
    console.log('\n1️⃣ Getting projects...');
    const allProjectsResponse = await axios.get(`${API_BASE_URL}/projects`);
    const projects = allProjectsResponse.data.data;
    
    if (projects.length === 0) {
      console.log('❌ No projects found.');
      return;
    }
    
    // Find a project that should have related data (like Concourse Skyline)
    let testProject = null;
    for (const project of projects) {
      if (project.name && project.name.toLowerCase().includes('concourse')) {
        testProject = project;
        break;
      }
    }
    
    if (!testProject) {
      testProject = projects[0]; // Use first project if Concourse not found
    }
    
    console.log(`📋 Testing with project: ${testProject.name} (ID: ${testProject.id})`);
    
    // Test with populate
    console.log('\n2️⃣ Testing with populate=*...');
    const populateResponse = await axios.get(`${API_BASE_URL}/projects/${testProject.id}?populate=*`);
    
    if (populateResponse.status === 200) {
      console.log('✅ Status: 200 OK');
      
      const project = populateResponse.data.data;
      
      console.log('\n📊 Project Details:');
      console.log(`   🏠 Name: ${project.name || 'N/A'}`);
      console.log(`   📍 Location: ${project.location || 'N/A'}`);
      console.log(`   💰 Price From: ${project.price_from || 'N/A'}`);
      
      // Check for related data
      console.log('\n🔗 Related Data:');
      
      // Unit Pricing
      if (project.unit_pricing && project.unit_pricing.data) {
        const unitPricing = project.unit_pricing.data;
        console.log(`   💵 Unit Pricing: ${Array.isArray(unitPricing) ? unitPricing.length : 1} record(s)`);
        if (Array.isArray(unitPricing) && unitPricing.length > 0) {
          console.log(`      Sample: ${unitPricing[0].unit_type || 'N/A'} - ${unitPricing[0].price_from || 'N/A'}`);
        }
      } else {
        console.log('   💵 Unit Pricing: No data found');
      }
      
      // Floor Plans
      if (project.floor_plans && project.floor_plans.data) {
        const floorPlans = project.floor_plans.data;
        console.log(`   🏗️  Floor Plans: ${Array.isArray(floorPlans) ? floorPlans.length : 1} record(s)`);
        if (Array.isArray(floorPlans) && floorPlans.length > 0) {
          console.log(`      Sample: ${floorPlans[0].floor_plan_name || 'N/A'}`);
        }
      } else {
        console.log('   🏗️  Floor Plans: No data found');
      }
      
      // Site Plans
      if (project.site_plans && project.site_plans.data) {
        const sitePlans = project.site_plans.data;
        console.log(`   🗺️  Site Plans: ${Array.isArray(sitePlans) ? sitePlans.length : 1} record(s)`);
        if (Array.isArray(sitePlans) && sitePlans.length > 0) {
          console.log(`      Sample: ${sitePlans[0].site_plan_name || 'N/A'}`);
        }
      } else {
        console.log('   🗺️  Site Plans: No data found');
      }
      
      // Brochures
      if (project.brochures && project.brochures.data) {
        const brochures = project.brochures.data;
        console.log(`   📄 Brochures: ${Array.isArray(brochures) ? brochures.length : 1} record(s)`);
        if (Array.isArray(brochures) && brochures.length > 0) {
          console.log(`      Sample: ${brochures[0].brochure_title || 'N/A'}`);
        }
      } else {
        console.log('   📄 Brochures: No data found');
      }
      
      // Show all available keys
      console.log('\n📋 All Available Keys:');
      const availableKeys = Object.keys(project).filter(key => key !== 'id');
      console.log(`   ${availableKeys.join(', ')}`);
      
    } else {
      console.log(`❌ Unexpected status: ${populateResponse.status}`);
    }
    
    console.log('\n🎉 Test Complete!');
    
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log('Error response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProjectWithRelations();
