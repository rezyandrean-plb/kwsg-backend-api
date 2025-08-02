const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'https://striking-hug-052e89dfad.strapiapp.com';
const API_ENDPOINT = '/api/projects';

async function testProjectsAPI() {
  console.log('🔍 Testing /api/projects endpoint...\n');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📍 Endpoint: ${API_ENDPOINT}`);
  console.log(`📍 Full URL: ${BASE_URL}${API_ENDPOINT}\n`);
  
  try {
    // Test 1: Basic GET request
    console.log('📋 Test 1: Basic GET request to /api/projects');
    const response = await axios.get(`${BASE_URL}${API_ENDPOINT}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Request successful!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    console.log(`   Response Time: ${response.headers['x-response-time'] || 'N/A'}`);
    
    // Test 2: Analyze response structure
    console.log('\n📋 Test 2: Analyzing response structure...');
    const data = response.data;
    
    if (data && typeof data === 'object') {
      console.log('   Response structure:');
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (Array.isArray(value)) {
          console.log(`   - ${key}: Array with ${value.length} items`);
        } else if (typeof value === 'object') {
          console.log(`   - ${key}: Object with ${Object.keys(value).length} properties`);
        } else {
          console.log(`   - ${key}: ${typeof value} (${value})`);
        }
      });
      
      // Test 3: Analyze data array if it exists
      if (data.data && Array.isArray(data.data)) {
        console.log('\n📋 Test 3: Analyzing projects data...');
        console.log(`   Total projects: ${data.data.length}`);
        
        if (data.data.length > 0) {
          console.log('   Sample project structure:');
          const sampleProject = data.data[0];
          Object.keys(sampleProject).forEach(key => {
            const value = sampleProject[key];
            if (Array.isArray(value)) {
              console.log(`     - ${key}: Array with ${value.length} items`);
            } else if (typeof value === 'object' && value !== null) {
              console.log(`     - ${key}: Object with ${Object.keys(value).length} properties`);
            } else {
              console.log(`     - ${key}: ${typeof value} (${value})`);
            }
          });
          
          // Test 4: Check for specific fields that indicate table structure
          console.log('\n📋 Test 4: Checking for database table indicators...');
          const tableIndicators = ['id', 'created_at', 'updated_at', 'published_at'];
          tableIndicators.forEach(indicator => {
            if (sampleProject.hasOwnProperty(indicator)) {
              console.log(`   ✅ Found table indicator: ${indicator} = ${sampleProject[indicator]}`);
            } else {
              console.log(`   ❌ Missing table indicator: ${indicator}`);
            }
          });
          
          // Test 5: Check for Strapi-specific fields
          console.log('\n📋 Test 5: Checking for Strapi-specific fields...');
          const strapiFields = ['_id', 'id', 'createdAt', 'updatedAt', 'publishedAt'];
          strapiFields.forEach(field => {
            if (sampleProject.hasOwnProperty(field)) {
              console.log(`   ✅ Found Strapi field: ${field} = ${sampleProject[field]}`);
            }
          });
        }
      }
    }
    
    // Test 6: Test with query parameters
    console.log('\n📋 Test 6: Testing with query parameters...');
    try {
      const queryResponse = await axios.get(`${BASE_URL}${API_ENDPOINT}`, {
        params: {
          _limit: 5,
          _sort: 'created_at:desc'
        },
        timeout: 10000
      });
      
      if (queryResponse.data && queryResponse.data.data) {
        console.log(`   Query test successful: ${queryResponse.data.data.length} projects returned`);
      }
    } catch (queryError) {
      console.log(`   Query test failed: ${queryError.message}`);
    }
    
    // Test 7: Test individual project endpoint
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Test 7: Testing individual project endpoint...');
      const firstProjectId = data.data[0].id;
      
      try {
        const singleResponse = await axios.get(`${BASE_URL}${API_ENDPOINT}/${firstProjectId}`, {
          timeout: 10000
        });
        
        console.log(`   Single project test successful for ID: ${firstProjectId}`);
        if (singleResponse.data && singleResponse.data.data) {
          console.log(`   Project name: ${singleResponse.data.data.name || 'N/A'}`);
        }
      } catch (singleError) {
        console.log(`   Single project test failed: ${singleError.message}`);
      }
    }
    
    console.log('\n✅ API testing completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received - server might be down');
      console.error('   Request details:', error.request);
    }
    
    // Try alternative URLs
    console.log('\n🔄 Trying alternative URLs...');
    const alternativeUrls = [
      'http://127.0.0.1:1337',
      'https://localhost:1337',
      'http://localhost:3000',
      'http://localhost:8080'
    ];
    
    for (const url of alternativeUrls) {
      try {
        console.log(`\n🔄 Trying ${url}${API_ENDPOINT}...`);
        const altResponse = await axios.get(`${url}${API_ENDPOINT}`, {
          timeout: 5000
        });
        console.log(`✅ Alternative URL successful: ${url}`);
        console.log(`   Status: ${altResponse.status}`);
        break;
      } catch (altError) {
        console.log(`❌ ${url} failed: ${altError.message}`);
      }
    }
  }
}

// Run the test
testProjectsAPI().then(() => {
  console.log('\n🏁 API test script completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 API test script failed:', error);
  process.exit(1);
}); 