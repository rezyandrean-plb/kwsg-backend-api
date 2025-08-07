const axios = require('axios');

const API_BASE_URL = 'http://localhost:1337/api';

async function debugProjectResponse() {
  console.log('🔍 Debugging Project API Response');
  console.log('=' .repeat(40));
  
  try {
    // Get a project ID first
    const allProjectsResponse = await axios.get(`${API_BASE_URL}/projects`);
    const projects = allProjectsResponse.data.data;
    
    if (projects.length === 0) {
      console.log('❌ No projects found.');
      return;
    }
    
    const testProjectId = projects[0].id;
    console.log(`📋 Testing with project ID: ${testProjectId}`);
    
    // Test 1: Basic project request
    console.log('\n1️⃣ Basic project request:');
    const basicResponse = await axios.get(`${API_BASE_URL}/projects/${testProjectId}`);
    console.log(`Status: ${basicResponse.status}`);
    console.log('Response structure:');
    console.log(JSON.stringify(basicResponse.data, null, 2));
    
    // Test 2: With populate
    console.log('\n2️⃣ With populate=*:');
    const populateResponse = await axios.get(`${API_BASE_URL}/projects/${testProjectId}?populate=*`);
    console.log(`Status: ${populateResponse.status}`);
    console.log('Response structure:');
    console.log(JSON.stringify(populateResponse.data, null, 2));
    
    // Test 3: Check the projects list structure
    console.log('\n3️⃣ Projects list structure:');
    console.log('First project from list:');
    console.log(JSON.stringify(projects[0], null, 2));
    
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log('Error response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugProjectResponse();
