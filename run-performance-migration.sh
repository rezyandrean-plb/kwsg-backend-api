#!/bin/bash

# Performance Migration Script
# This script runs the performance optimization migration

echo "🚀 Starting Performance Migration"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Strapi is running
echo "📡 Checking if Strapi is running..."
if ! curl -s http://localhost:1337/api/projects/ultra-simple-test > /dev/null; then
    echo "❌ Error: Strapi is not running. Please start Strapi first:"
    echo "   npm run develop"
    exit 1
fi

echo "✅ Strapi is running"

# Run the migration
echo "🗄️  Running performance migration..."
npm run strapi database:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi

# Test the performance improvements
echo "🧪 Testing performance improvements..."
node test-api-performance.js

echo "🎉 Performance migration completed!"
echo ""
echo "📊 Performance improvements applied:"
echo "   • Enhanced caching (10min TTL for projects, 30min for developers)"
echo "   • Optimized database queries with specific field selection"
echo "   • Concurrent data fetching in findOne method"
echo "   • Database indexes for faster queries"
echo "   • Improved connection pooling"
echo "   • Case-insensitive search optimization"
echo ""
echo "🔧 Next steps:"
echo "   1. Monitor API response times"
echo "   2. Check server logs for cache hits"
echo "   3. Run performance tests periodically"
echo "   4. Consider implementing Redis for production"
