const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:1337/api';
const TEST_TIMEOUT = 30000; // 30 seconds

// Test data for creating/updating projects
const sampleProject = {
  name: "Test Project API",
  project_name: "test-project-api",
  slug: "test-project-api",
  title: "Test Project for API Testing",
  location: "Test Location",
  address: "123 Test Street, Test City",
  type: "Residential",
  price: "500,000",
  price_from: "450,000",
  price_per_sqft: "1,200",
  bedrooms: "2-4",
  bathrooms: "2-3",
  size: "800-1500 sqft",
  units: "150",
  developer: "Test Developer",
  completion: "2024",
  description: "This is a test project created for API testing purposes",
  features: ["Swimming Pool", "Gym", "Parking"],
  district: "Test District",
  tenure: "Freehold",
  property_type: "Apartment",
  status: "Under Construction",
  total_units: "150",
  total_floors: "25",
  site_area: "50,000 sqft",
  latitude: 25.2048,
  longitude: 55.2708,
  image_url_banner: "https://example.com/test-banner.jpg"
};

const updateProjectData = {
  name: "Updated Test Project API",
  title: "Updated Test Project for API Testing",
  price: "550,000",
  description: "This is an updated test project description"
};

class ProjectsAPITester {
  constructor() {
    this.createdProjectId = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running test: ${testName}`);
      await testFunction();
      this.testResults.passed++;
      this.log(`Test passed: ${testName}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
      this.log(`Test failed: ${testName} - ${error.message}`, 'error');
    }
  }

  // Test 1: Health Check - Ultra Simple Test
  async testHealthCheck() {
    const response = await axios.get(`${API_BASE_URL}/projects/ultra-simple-test`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.message || !response.data.status) {
      throw new Error('Invalid response structure');
    }
    
    this.log(`Health check response: ${JSON.stringify(response.data)}`);
  }

  // Test 2: Database Connection Test
  async testDatabaseConnection() {
    const response = await axios.get(`${API_BASE_URL}/projects/test`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.message || response.data.projectsCount === undefined) {
      throw new Error('Invalid database test response structure');
    }
    
    this.log(`Database test: ${response.data.message}, Projects count: ${response.data.projectsCount}`);
  }

  // Test 3: Get All Projects
  async testGetAllProjects() {
    const response = await axios.get(`${API_BASE_URL}/projects`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!Array.isArray(response.data.data)) {
      throw new Error('Response data should be an array');
    }
    
    this.log(`Retrieved ${response.data.data.length} projects`);
    
    // If there are projects, log the first one for structure verification
    if (response.data.data.length > 0) {
      this.log(`Sample project structure: ${JSON.stringify(response.data.data[0], null, 2)}`);
    }
  }

  // Test 4: Get Projects with Pagination
  async testGetProjectsWithPagination() {
    const response = await axios.get(`${API_BASE_URL}/projects?pagination[page]=1&pagination[pageSize]=5`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    this.log(`Pagination test: Retrieved ${response.data.data.length} projects`);
  }

  // Test 5: Get Projects with Sorting
  async testGetProjectsWithSorting() {
    const response = await axios.get(`${API_BASE_URL}/projects?sort=name:asc`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    this.log(`Sorting test: Retrieved ${response.data.data.length} projects sorted by name`);
  }

  // Test 6: Get Projects by Location
  async testGetProjectsByLocation() {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/location/Dubai`, {
        timeout: TEST_TIMEOUT
      });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      
      this.log(`Location filter test: Found ${response.data.data.length} projects in Dubai`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.log('No projects found for location "Dubai" - this is expected if no data exists', 'warning');
      } else {
        throw error;
      }
    }
  }

  // Test 7: Search Projects
  async testSearchProjects() {
    const response = await axios.get(`${API_BASE_URL}/projects/search`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    this.log(`Search test: Found ${response.data.data.length} projects`);
  }

  // Test 8: Create New Project
  async testCreateProject() {
    const response = await axios.post(`${API_BASE_URL}/projects`, sampleProject, {
      timeout: TEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.data || !response.data.data.id) {
      throw new Error('Created project should have an ID');
    }
    
    this.createdProjectId = response.data.data.id;
    this.log(`Created project with ID: ${this.createdProjectId}`);
    this.log(`Created project data: ${JSON.stringify(response.data.data, null, 2)}`);
  }

  // Test 9: Get Project by ID
  async testGetProjectById() {
    if (!this.createdProjectId) {
      throw new Error('No project ID available for testing');
    }
    
    const response = await axios.get(`${API_BASE_URL}/projects/${this.createdProjectId}`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.data || response.data.data.id !== this.createdProjectId) {
      throw new Error('Retrieved project ID does not match created project ID');
    }
    
    this.log(`Retrieved project details: ${JSON.stringify(response.data.data, null, 2)}`);
    
    // Verify that related data is included
    const project = response.data.data;
    this.log(`Project has ${project.images ? project.images.length : 0} images`);
    this.log(`Project has ${project.facilities ? project.facilities.length : 0} facilities`);
    this.log(`Project has ${project.features ? project.features.length : 0} features`);
    this.log(`Project has ${project.floorPlans ? project.floorPlans.length : 0} floor plans`);
    this.log(`Project has ${project.unitAvailability ? project.unitAvailability.length : 0} unit availability records`);
    this.log(`Project has ${project.brochures ? project.brochures.length : 0} brochures`);
  }

  // Test 10: Update Project
  async testUpdateProject() {
    if (!this.createdProjectId) {
      throw new Error('No project ID available for testing');
    }
    
    const response = await axios.put(`${API_BASE_URL}/projects/${this.createdProjectId}`, updateProjectData, {
      timeout: TEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.data || response.data.data.id !== this.createdProjectId) {
      throw new Error('Updated project ID does not match created project ID');
    }
    
    // Verify that the update was applied
    if (response.data.data.name !== updateProjectData.name) {
      throw new Error('Project name was not updated correctly');
    }
    
    this.log(`Updated project: ${JSON.stringify(response.data.data, null, 2)}`);
  }

  // Test 11: Get Non-existent Project
  async testGetNonExistentProject() {
    try {
      await axios.get(`${API_BASE_URL}/projects/999999`, {
        timeout: TEST_TIMEOUT
      });
      throw new Error('Expected 404 error for non-existent project');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.log('Correctly received 404 for non-existent project', 'success');
      } else {
        throw new Error(`Expected 404 error, got ${error.response ? error.response.status : 'unknown'}`);
      }
    }
  }

  // Test 12: Create Project with Invalid Data
  async testCreateProjectWithInvalidData() {
    try {
      await axios.post(`${API_BASE_URL}/projects`, {}, {
        timeout: TEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      throw new Error('Expected 400 error for invalid project data');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('Correctly received 400 for invalid project data', 'success');
      } else {
        throw new Error(`Expected 400 error, got ${error.response ? error.response.status : 'unknown'}`);
      }
    }
  }

  // Test 13: Update Non-existent Project
  async testUpdateNonExistentProject() {
    try {
      await axios.put(`${API_BASE_URL}/projects/999999`, updateProjectData, {
        timeout: TEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      throw new Error('Expected 404 error for updating non-existent project');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.log('Correctly received 404 for updating non-existent project', 'success');
      } else {
        throw new Error(`Expected 404 error, got ${error.response ? error.response.status : 'unknown'}`);
      }
    }
  }

  // Test 14: Delete Project
  async testDeleteProject() {
    if (!this.createdProjectId) {
      throw new Error('No project ID available for testing');
    }
    
    const response = await axios.delete(`${API_BASE_URL}/projects/${this.createdProjectId}`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.data || !response.data.data.deleted) {
      throw new Error('Delete response should indicate successful deletion');
    }
    
    this.log(`Successfully deleted project with ID: ${this.createdProjectId}`);
  }

  // Test 15: Delete Non-existent Project
  async testDeleteNonExistentProject() {
    try {
      await axios.delete(`${API_BASE_URL}/projects/999999`, {
        timeout: TEST_TIMEOUT
      });
      // Note: DELETE might return 200 even for non-existent items, depending on implementation
      this.log('Delete non-existent project test completed', 'success');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.log('Correctly received 404 for deleting non-existent project', 'success');
      } else {
        this.log(`Delete non-existent project returned: ${error.response ? error.response.status : 'unknown'}`, 'warning');
      }
    }
  }

  // Test 16: Performance Test - Multiple Concurrent Requests
  async testPerformance() {
    const concurrentRequests = 5;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(axios.get(`${API_BASE_URL}/projects`, { timeout: TEST_TIMEOUT }));
    }
    
    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    const totalTime = endTime - startTime;
    const avgTime = totalTime / concurrentRequests;
    
    this.log(`Performance test: ${concurrentRequests} concurrent requests completed in ${totalTime}ms (avg: ${avgTime}ms)`);
    
    // Verify all responses are successful
    responses.forEach((response, index) => {
      if (response.status !== 200) {
        throw new Error(`Request ${index + 1} failed with status ${response.status}`);
      }
    });
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting Comprehensive Projects API Tests', 'success');
    this.log('=' .repeat(80));
    
    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Database Connection', fn: () => this.testDatabaseConnection() },
      { name: 'Get All Projects', fn: () => this.testGetAllProjects() },
      { name: 'Get Projects with Pagination', fn: () => this.testGetProjectsWithPagination() },
      { name: 'Get Projects with Sorting', fn: () => this.testGetProjectsWithSorting() },
      { name: 'Get Projects by Location', fn: () => this.testGetProjectsByLocation() },
      { name: 'Search Projects', fn: () => this.testSearchProjects() },
      { name: 'Create New Project', fn: () => this.testCreateProject() },
      { name: 'Get Project by ID', fn: () => this.testGetProjectById() },
      { name: 'Update Project', fn: () => this.testUpdateProject() },
      { name: 'Get Non-existent Project', fn: () => this.testGetNonExistentProject() },
      { name: 'Create Project with Invalid Data', fn: () => this.testCreateProjectWithInvalidData() },
      { name: 'Update Non-existent Project', fn: () => this.testUpdateNonExistentProject() },
      { name: 'Delete Project', fn: () => this.testDeleteProject() },
      { name: 'Delete Non-existent Project', fn: () => this.testDeleteNonExistentProject() },
      { name: 'Performance Test', fn: () => this.testPerformance() }
    ];
    
    for (const test of tests) {
      await this.runTest(test.name, test.fn);
    }
    
    this.printSummary();
  }

  printSummary() {
    this.log('=' .repeat(80));
    this.log('📊 TEST SUMMARY', 'success');
    this.log('=' .repeat(80));
    this.log(`✅ Passed: ${this.testResults.passed}`);
    this.log(`❌ Failed: ${this.testResults.failed}`);
    this.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(2)}%`);
    
    if (this.testResults.errors.length > 0) {
      this.log('\n❌ FAILED TESTS:', 'error');
      this.testResults.errors.forEach(error => {
        this.log(`   - ${error.test}: ${error.error}`, 'error');
      });
    }
    
    if (this.testResults.failed === 0) {
      this.log('\n🎉 ALL TESTS PASSED!', 'success');
    } else {
      this.log('\n⚠️  Some tests failed. Please review the errors above.', 'warning');
    }
  }
}

// Run the comprehensive test suite
async function main() {
  const tester = new ProjectsAPITester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test suite failed to run:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = ProjectsAPITester;
