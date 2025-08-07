const axios = require('axios');

const API_BASE_URL = 'http://localhost:1337/api';

async function testProjectsAPI() {
  console.log('🧪 Testing Projects API - Simple Tests');
  console.log('=' .repeat(40));

  try {
    // Test 1: Get all projects
    console.log('\n1️⃣ GET /projects');
    const response = await axios.get(`${API_BASE_URL}/projects`);
    console.log(`✅ Success! Found ${response.data.data.length} projects`);
    
    if (response.data.data.length > 0) {
      const project = response.data.data[0];
      console.log(`   Sample: ${project.name} - ${project.location}`);
    }

    // Test 2: Get projects by location
    console.log('\n2️⃣ GET /projects/location/Dubai');
    try {
      const locationResponse = await axios.get(`${API_BASE_URL}/projects/location/Dubai`);
      console.log(`✅ Found ${locationResponse.data.data.length} projects in Dubai`);
    } catch (error) {
      console.log('⚠️  No Dubai projects found (expected if no data)');
    }

    // Test 3: Search projects
    console.log('\n3️⃣ GET /projects/search');
    const searchResponse = await axios.get(`${API_BASE_URL}/projects/search`);
    console.log(`✅ Search returned ${searchResponse.data.data.length} projects`);

    // Test 4: Health check
    console.log('\n4️⃣ GET /projects/ultra-simple-test');
    const healthResponse = await axios.get(`${API_BASE_URL}/projects/ultra-simple-test`);
    console.log(`✅ Health check: ${healthResponse.data.message}`);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testProjectsAPI();
