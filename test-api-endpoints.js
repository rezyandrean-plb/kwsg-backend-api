const axios = require('axios');

const API_BASE_URL = 'http://localhost:1337/api';

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints');
  console.log('========================');
  
  try {
    // Test 1: Basic projects endpoint
    console.log('\n1️⃣ Testing GET /projects');
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Total projects: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        const firstProject = response.data.data[0];
        console.log(`📋 Sample project: ${firstProject.attributes?.name || 'No name'}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
    }

    // Test 2: Projects with pagination
    console.log('\n2️⃣ Testing GET /projects with pagination');
    try {
      const response = await axios.get(`${API_BASE_URL}/projects?pagination[pageSize]=5`);
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Projects returned: ${response.data.data?.length || 0}`);
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
    }

    // Test 3: Single project details
    console.log('\n3️⃣ Testing GET /projects/:id');
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/87`);
      console.log(`✅ Status: ${response.status}`);
      if (response.data.data) {
        const project = response.data.data.attributes;
        console.log(`📋 Project: ${project.name || 'No name'}`);
        console.log(`📍 Location: ${project.location || 'No location'}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
    }

    // Test 4: Project with populated relations
    console.log('\n4️⃣ Testing GET /projects/:id with populate');
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/87?populate=*`);
      console.log(`✅ Status: ${response.status}`);
      if (response.data.data) {
        const project = response.data.data.attributes;
        console.log(`📋 Project: ${project.name || 'No name'}`);
        console.log(`🔗 Relations available: ${Object.keys(project).filter(key => key.includes('data')).join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
    }

    // Test 5: Search endpoint
    console.log('\n5️⃣ Testing GET /projects/search');
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/search?q=residence`);
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Search results: ${response.data.data?.length || 0}`);
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
    }

    // Test 6: Location filter
    console.log('\n6️⃣ Testing GET /projects/location/:location');
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/location/Dubai`);
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Location results: ${response.data.data?.length || 0}`);
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
    }

    console.log('\n🎉 API Endpoint Testing Complete!');

  } catch (error) {
    console.log(`❌ General error: ${error.message}`);
  }
}

testAPIEndpoints();
