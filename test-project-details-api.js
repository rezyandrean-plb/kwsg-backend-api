const axios = require('axios');

const API_BASE_URL = 'http://localhost:1337/api';

async function testProjectDetailsAPI() {
  console.log('🧪 Testing Project Details API (GET /projects/:id)');
  console.log('=' .repeat(50));

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

    // Step 2: Test project details endpoint
    console.log('\n2️⃣ Testing project details endpoint...');
    const detailsResponse = await axios.get(`${API_BASE_URL}/projects/${testProjectId}`);
    const projectDetails = detailsResponse.data.data;
    
    console.log('✅ Project details retrieved successfully!');
    console.log(`📋 Project: ${projectDetails.name}`);
    console.log(`📍 Location: ${projectDetails.location}`);
    console.log(`💰 Price: ${projectDetails.price}`);
    
    // Step 3: Verify related data is included
    console.log('\n3️⃣ Verifying related data...');
    const relatedData = {
      images: projectDetails.images?.length || 0,
      facilities: projectDetails.facilities?.length || 0,
      features: projectDetails.features?.length || 0,
      floorPlans: projectDetails.floorPlans?.length || 0,
      unitAvailability: projectDetails.unitAvailability?.length || 0,
      brochures: projectDetails.brochures?.length || 0
    };
    
    console.log('📊 Related data counts:');
    Object.entries(relatedData).forEach(([key, count]) => {
      console.log(`   ${key}: ${count}`);
    });

    // Step 4: Test non-existent project
    console.log('\n4️⃣ Testing non-existent project...');
    try {
      await axios.get(`${API_BASE_URL}/projects/999999`);
      console.log('❌ Expected 404 error for non-existent project');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly received 404 for non-existent project');
      } else {
        console.log(`⚠️  Unexpected error: ${error.response?.status || error.message}`);
      }
    }

    console.log('\n🎉 Project Details API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testProjectDetailsAPI();
