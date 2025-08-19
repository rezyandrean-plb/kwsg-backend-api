const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:1337'; // Change this to your API URL
const ENDPOINTS = [
  '/api/projects',
  '/api/projects/minimal',
  '/api/projects?page=1&pageSize=10',
  '/api/projects?page=1&pageSize=50'
];

async function testEndpoint(endpoint, iterations = 5) {
  console.log(`\n🧪 Testing endpoint: ${endpoint}`);
  console.log(`📊 Running ${iterations} iterations...`);
  
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      times.push(duration);
      
      console.log(`  Iteration ${i + 1}: ${duration}ms (${response.data.data?.length || 0} items)`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  ❌ Error in iteration ${i + 1}:`, error.message);
    }
  }
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`\n📈 Results for ${endpoint}:`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime}ms`);
    console.log(`  Max: ${maxTime}ms`);
    
    return { endpoint, avgTime, minTime, maxTime, times };
  }
  
  return null;
}

async function runPerformanceTest() {
  console.log('🚀 Starting API Performance Test');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n🎯 Performance Summary:');
  console.log('='.repeat(60));
  
  results.sort((a, b) => a.avgTime - b.avgTime);
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.endpoint}`);
    console.log(`   Average: ${result.avgTime.toFixed(2)}ms`);
    console.log(`   Range: ${result.minTime}ms - ${result.maxTime}ms`);
    console.log('');
  });
  
  // Compare optimized vs original
  const original = results.find(r => r.endpoint === '/api/projects');
  const minimal = results.find(r => r.endpoint === '/api/projects/minimal');
  
  if (original && minimal) {
    const improvement = ((original.avgTime - minimal.avgTime) / original.avgTime * 100).toFixed(2);
    console.log(`💡 Performance Improvement: ${improvement}% faster with minimal endpoint`);
  }
  
  console.log('✅ Performance test completed!');
}

// Run the test
runPerformanceTest().catch(console.error);
