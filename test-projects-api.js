const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:1337';
const API_BASE = `${BASE_URL}/api`;

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.cyan}${message}${colors.reset}`);
  log('='.repeat(message.length), 'cyan');
}

async function testEndpoint(url, description, expectedStatus = 200) {
  try {
    logInfo(`Testing: ${description}`);
    logInfo(`URL: ${url}`);
    
    const startTime = Date.now();
    const response = await axios.get(url, TEST_CONFIG);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.status === expectedStatus) {
      logSuccess(`${description} - Status: ${response.status} (${responseTime}ms)`);
      
      // Log response details
      if (response.data) {
        if (Array.isArray(response.data.data)) {
          logInfo(`  📊 Records returned: ${response.data.data.length}`);
          if (response.data.data.length > 0) {
            logInfo(`  📋 Sample record ID: ${response.data.data[0].id}`);
            logInfo(`  📋 Sample record name: ${response.data.data[0].name || 'N/A'}`);
          }
        } else if (response.data.data && response.data.data.id) {
          logInfo(`  📋 Record ID: ${response.data.data.id}`);
          logInfo(`  📋 Record name: ${response.data.data.name || 'N/A'}`);
        }
      }
      
      return { success: true, data: response.data, responseTime };
    } else {
      logError(`${description} - Expected status ${expectedStatus}, got ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    if (error.response) {
      logError(`${description} - Status: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data) {
        logError(`  Error details: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } else if (error.code === 'ECONNREFUSED') {
      logError(`${description} - Connection refused. Is the server running on ${BASE_URL}?`);
    } else {
      logError(`${description} - ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function testProjectsList() {
  logHeader('🏗️  Testing Projects List Endpoint');
  
  const tests = [
    {
      url: `${API_BASE}/projects`,
      description: 'Get all projects (default)',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects?limit=5`,
      description: 'Get projects with limit=5',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects?start=0&limit=10`,
      description: 'Get projects with pagination (start=0, limit=10)',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects?sort=name:asc`,
      description: 'Get projects sorted by name ascending',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects?sort=created_at:desc`,
      description: 'Get projects sorted by creation date descending',
      expectedStatus: 200
    }
  ];
  
  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description, test.expectedStatus);
    results.push({ ...test, result });
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function testProjectDetails() {
  logHeader('📋 Testing Project Details Endpoint');
  
  // First, get a list of projects to get some IDs for testing
  try {
    const projectsResponse = await axios.get(`${API_BASE}/projects?limit=5`, TEST_CONFIG);
    const projects = projectsResponse.data.data;
    
    if (!projects || projects.length === 0) {
      logWarning('No projects found to test details endpoint');
      return [];
    }
    
    const tests = [];
    
    // Test with valid project IDs
    for (let i = 0; i < Math.min(3, projects.length); i++) {
      const project = projects[i];
      tests.push({
        url: `${API_BASE}/projects/${project.id}`,
        description: `Get project details for ID ${project.id} (${project.name || 'Unnamed'})`,
        expectedStatus: 200
      });
    }
    
    // Test with invalid project ID
    tests.push({
      url: `${API_BASE}/projects/999999`,
      description: 'Get project details with invalid ID (should return 404)',
      expectedStatus: 404
    });
    
    const results = [];
    for (const test of tests) {
      const result = await testEndpoint(test.url, test.description, test.expectedStatus);
      results.push({ ...test, result });
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
    
  } catch (error) {
    logError(`Failed to get projects for details testing: ${error.message}`);
    return [];
  }
}

async function testProjectSearch() {
  logHeader('🔍 Testing Project Search Endpoints');
  
  const tests = [
    {
      url: `${API_BASE}/projects/location/D20`,
      description: 'Get projects by location (D20)',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects/location/Singapore`,
      description: 'Get projects by location (Singapore)',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects/search?name=Park`,
      description: 'Search projects by name containing "Park"',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects/search?developer=Far`,
      description: 'Search projects by developer containing "Far"',
      expectedStatus: 200
    }
  ];
  
  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description, test.expectedStatus);
    results.push({ ...test, result });
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function testProjectTestEndpoints() {
  logHeader('🧪 Testing Project Test Endpoints');
  
  const tests = [
    {
      url: `${API_BASE}/projects/test`,
      description: 'Test database connection',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects/simple-test`,
      description: 'Simple API test',
      expectedStatus: 200
    },
    {
      url: `${API_BASE}/projects/ultra-simple-test`,
      description: 'Ultra simple API test',
      expectedStatus: 200
    }
  ];
  
  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description, test.expectedStatus);
    results.push({ ...test, result });
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function generateTestReport(allResults) {
  logHeader('📊 Test Results Summary');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  for (const [category, results] of Object.entries(allResults)) {
    log(`\n${colors.bold}${category}:${colors.reset}`, 'cyan');
    
    for (const test of results) {
      totalTests++;
      if (test.result.success) {
        passedTests++;
        logSuccess(`  ${test.description}`);
      } else {
        failedTests++;
        logError(`  ${test.description}`);
      }
    }
  }
  
  logHeader('📈 Overall Statistics');
  log(`Total Tests: ${totalTests}`, 'bold');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, 'red');
  log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'bold');
  
  if (failedTests === 0) {
    logSuccess('\n🎉 All tests passed! The Projects API is working correctly.');
  } else {
    logWarning(`\n⚠️  ${failedTests} test(s) failed. Please check the errors above.`);
  }
}

async function main() {
  logHeader('🚀 Starting Projects API Tests');
  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`API Base: ${API_BASE}`);
  logInfo(`Test timeout: ${TEST_CONFIG.timeout}ms`);
  
  try {
    // Test all endpoints
    const listResults = await testProjectsList();
    const detailsResults = await testProjectDetails();
    const searchResults = await testProjectSearch();
    const testResults = await testProjectTestEndpoints();
    
    // Generate report
    const allResults = {
      'Projects List Tests': listResults,
      'Project Details Tests': detailsResults,
      'Project Search Tests': searchResults,
      'Project Test Endpoints': testResults
    };
    
    await generateTestReport(allResults);
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
}); 