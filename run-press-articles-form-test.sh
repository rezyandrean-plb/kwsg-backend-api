#!/bin/bash

echo "🧪 Running Press Articles Form API Test"
echo "========================================"

# Check if Strapi is running
echo "Checking if Strapi is running..."
if curl -s http://localhost:1337/api/press-articles > /dev/null; then
    echo "✅ Strapi is running"
else
    echo "❌ Strapi is not running. Please start Strapi first."
    echo "   Run: npm run develop"
    exit 1
fi

# Run the test
echo "Running API test..."
node test-press-articles-form.js

echo "Test completed!" 