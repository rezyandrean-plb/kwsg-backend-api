const axios = require('axios');

const API_BASE_URL = 'http://localhost:1337/api';

async function testCurrentAPI() {
  console.log('🧪 Testing Current API Functionality');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Check if server is running
    console.log('\n1️⃣ Checking server status...');
    const healthResponse = await axios.get(`${API_BASE_URL}/projects`);
    console.log('✅ Server is running');
    console.log(`📊 Found ${healthResponse.data.data.length} projects`);
    
    // Test 2: Get a specific project
    const testProject = healthResponse.data.data[0];
    console.log(`\n2️⃣ Testing project: ${testProject.name} (ID: ${testProject.id})`);
    
    const projectResponse = await axios.get(`${API_BASE_URL}/projects/${testProject.id}`);
    
    if (projectResponse.status === 200) {
      console.log('✅ Project details retrieved successfully');
      
      const project = projectResponse.data.data;
      
      console.log('\n📊 Project Details:');
      console.log(`   🏠 Name: ${project.name || 'N/A'}`);
      console.log(`   📍 Location: ${project.location || 'N/A'}`);
      console.log(`   💰 Price From: ${project.price_from || 'N/A'}`);
      console.log(`   🏢 Developer: ${project.developer || 'N/A'}`);
      console.log(`   📅 Completion: ${project.completion || 'N/A'}`);
      console.log(`   🏘️  Units: ${project.units || 'N/A'}`);
      console.log(`   🏗️  Property Type: ${project.property_type || 'N/A'}`);
      console.log(`   📋 Tenure: ${project.tenure || 'N/A'}`);
      
      // Check for related data arrays
      console.log('\n🔗 Related Data Arrays:');
      console.log(`   💵 Unit Pricing: ${project.unit_pricing ? 'Available' : 'Not available'}`);
      console.log(`   🏗️  Floor Plans: ${project.floorPlans ? project.floorPlans.length : 0} records`);
      console.log(`   🗺️  Site Plans: ${project.site_plans ? 'Available' : 'Not available'}`);
      console.log(`   📄 Brochures: ${project.brochures ? project.brochures.length : 0} records`);
      console.log(`   🖼️  Images: ${project.images ? project.images.length : 0} records`);
      
      // Show all available keys
      console.log('\n📋 All Available Keys:');
      const availableKeys = Object.keys(project).filter(key => key !== 'id');
      console.log(`   ${availableKeys.join(', ')}`);
      
    } else {
      console.log(`❌ Unexpected status: ${projectResponse.status}`);
    }
    
    // Test 3: Test with populate
    console.log('\n3️⃣ Testing with populate=*...');
    const populateResponse = await axios.get(`${API_BASE_URL}/projects/${testProject.id}?populate=*`);
    
    if (populateResponse.status === 200) {
      console.log('✅ Populate request successful');
      const populatedProject = populateResponse.data.data;
      
      console.log('\n📊 Populated Project Data:');
      console.log(`   🏠 Name: ${populatedProject.name || 'N/A'}`);
      console.log(`   📍 Location: ${populatedProject.location || 'N/A'}`);
      
      // Check if populate made any difference
      const hasRelations = populatedProject.unit_pricing || populatedProject.floor_plans || 
                          populatedProject.site_plans || populatedProject.brochures;
      
      if (hasRelations) {
        console.log('✅ Related data found in populate response');
      } else {
        console.log('ℹ️  No related data found in populate response (may need schema updates)');
      }
    } else {
      console.log(`❌ Populate request failed: ${populateResponse.status}`);
    }
    
    // Test 4: Test location filter
    console.log('\n4️⃣ Testing location filter...');
    const locationResponse = await axios.get(`${API_BASE_URL}/projects/location/Dubai`);
    
    if (locationResponse.status === 200) {
      console.log(`✅ Location filter: Found ${locationResponse.data.data.length} projects in Dubai`);
    } else {
      console.log(`❌ Location filter failed: ${locationResponse.status}`);
    }
    
    console.log('\n🎉 Current API Test Complete!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Basic project data is working');
    console.log('   ✅ Project details endpoint is working');
    console.log('   ✅ Location filtering is working');
    console.log('   ℹ️  Related data may need schema updates');
    
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log('Error response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCurrentAPI();
