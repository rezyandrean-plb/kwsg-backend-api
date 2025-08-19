#!/bin/bash

echo "🚀 Setting up API Performance Testing Environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install axios for performance testing
echo "📦 Installing axios for performance testing..."
npm install axios

if [ $? -eq 0 ]; then
    echo "✅ axios installed successfully"
else
    echo "❌ Failed to install axios"
    exit 1
fi

# Create a simple test script to verify the API is running
echo "🔧 Creating API health check script..."
cat > test-api-health.js << 'EOF'
const axios = require('axios');

async function checkAPIHealth() {
  const BASE_URL = 'http://localhost:1337';
  
  try {
    console.log('🏥 Checking API health...');
    
    // Test basic connectivity
    const response = await axios.get(`${BASE_URL}/api/projects/ultra-simple-test`);
    console.log('✅ API is running and responding');
    console.log('📊 Response:', response.data);
    
    // Test projects endpoint
    console.log('\n🧪 Testing projects endpoint...');
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects?page=1&pageSize=5`);
    console.log('✅ Projects endpoint working');
    console.log(`📊 Found ${projectsResponse.data.data?.length || 0} projects`);
    
    // Test minimal endpoint
    console.log('\n🧪 Testing minimal endpoint...');
    const minimalResponse = await axios.get(`${BASE_URL}/api/projects/minimal?page=1&pageSize=5`);
    console.log('✅ Minimal endpoint working');
    console.log(`📊 Found ${minimalResponse.data.data?.length || 0} projects`);
    
    console.log('\n🎉 All endpoints are working correctly!');
    console.log('💡 You can now run: node test-api-performance.js');
    
  } catch (error) {
    console.error('❌ API health check failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure your Strapi server is running on http://localhost:1337');
    console.log('2. Check if the server is accessible: curl http://localhost:1337/api/projects/ultra-simple-test');
    console.log('3. Verify your database connection');
    console.log('4. Check server logs for any errors');
  }
}

checkAPIHealth();
EOF

echo "✅ Health check script created"

# Make the script executable
chmod +x test-api-health.js

echo ""
echo "🎯 Setup Complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your Strapi server is running"
echo "2. Run health check: node test-api-health.js"
echo "3. Run performance test: node test-api-performance.js"
echo ""
echo "📚 Documentation: API_PERFORMANCE_OPTIMIZATION.md"
echo ""
