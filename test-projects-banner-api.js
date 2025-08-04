const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:1337';
const API_ENDPOINT = '/api/projects';

async function testProjectsBannerAPI() {
  try {
    console.log('🧪 Testing Projects API with image_url_banner field...');
    console.log(`📍 API Endpoint: ${BASE_URL}${API_ENDPOINT}`);
    
    // Make the API call
    const response = await axios.get(`${BASE_URL}${API_ENDPOINT}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ API call successful');
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Projects count: ${response.data.data?.length || 0}`);
    
    // Check if the response has data
    if (response.data && response.data.data && response.data.data.length > 0) {
      const firstProject = response.data.data[0];
      
      console.log('\n📋 Sample project data:');
      console.log(`  - ID: ${firstProject.id}`);
      console.log(`  - Name: ${firstProject.name}`);
      console.log(`  - Location: ${firstProject.location}`);
      console.log(`  - image_url_banner: ${firstProject.image_url_banner || 'NULL'}`);
      
      // Check if image_url_banner field exists in all projects
      const hasBannerField = response.data.data.every(project => 
        'image_url_banner' in project
      );
      
      if (hasBannerField) {
        console.log('\n✅ SUCCESS: image_url_banner field is present in all projects');
        
        // Count projects with banner images
        const projectsWithBanner = response.data.data.filter(project => 
          project.image_url_banner && project.image_url_banner.trim() !== ''
        );
        
        console.log(`📊 Projects with banner images: ${projectsWithBanner.length}/${response.data.data.length}`);
        
        if (projectsWithBanner.length > 0) {
          console.log('\n🎨 Projects with banner images:');
          projectsWithBanner.slice(0, 3).forEach(project => {
            console.log(`  - ${project.name}: ${project.image_url_banner}`);
          });
        }
        
      } else {
        console.log('\n❌ ERROR: image_url_banner field is missing in some projects');
        
        // Show which projects are missing the field
        const missingField = response.data.data.filter(project => 
          !('image_url_banner' in project)
        );
        
        console.log(`📊 Projects missing image_url_banner field: ${missingField.length}`);
        missingField.slice(0, 3).forEach(project => {
          console.log(`  - ${project.name} (ID: ${project.id})`);
        });
      }
      
    } else {
      console.log('\n⚠️  No projects found in the response');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing Projects API:', error.message);
    
    if (error.response) {
      console.error(`📊 Response status: ${error.response.status}`);
      console.error(`📊 Response data:`, error.response.data);
    }
    
    process.exit(1);
  }
}

// Run the test
testProjectsBannerAPI(); 