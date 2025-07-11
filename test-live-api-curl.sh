#!/bin/bash

# Quick Test Script for Live Press Articles API using curl
# Update the BASE_URL to your actual Strapi Cloud URL

BASE_URL="https://your-app-name.strapiapp.com/api"  # Replace with your actual URL

echo "🧪 Testing Live Press Articles API with curl..."
echo "📍 Testing against: $BASE_URL"
echo ""

# Test 1: Get all press articles
echo "1. Testing GET /press-articles"
curl -s "$BASE_URL/press-articles" | jq '.data | length' 2>/dev/null || curl -s "$BASE_URL/press-articles"
echo ""
echo ""

# Test 2: Get article by slug
echo "2. Testing GET /press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model"
curl -s "$BASE_URL/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model" | jq '.data.title' 2>/dev/null || curl -s "$BASE_URL/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model"
echo ""
echo ""

# Test 3: Get articles by year
echo "3. Testing GET /press-articles/year/2025"
curl -s "$BASE_URL/press-articles/year/2025" | jq '.data | length' 2>/dev/null || curl -s "$BASE_URL/press-articles/year/2025"
echo ""
echo ""

# Test 4: Get articles by source
echo "4. Testing GET /press-articles/source/Tech Coffee House"
curl -s "$BASE_URL/press-articles/source/Tech Coffee House" | jq '.data | length' 2>/dev/null || curl -s "$BASE_URL/press-articles/source/Tech Coffee House"
echo ""
echo ""

# Test 5: Search articles
echo "5. Testing GET /press-articles/search?query=KW Singapore"
curl -s "$BASE_URL/press-articles/search?query=KW Singapore" | jq '.data | length' 2>/dev/null || curl -s "$BASE_URL/press-articles/search?query=KW Singapore"
echo ""
echo ""

echo "✅ Quick tests completed!"
echo ""
echo "💡 If you see 'null' or empty responses, it might mean:"
echo "   - The API endpoints are not accessible (check URL)"
echo "   - Authentication is required (add API token)"
echo "   - The database migration hasn't been run yet"
echo ""
echo "🔧 To add authentication, use:"
echo "   curl -H 'Authorization: Bearer YOUR_API_TOKEN' $BASE_URL/press-articles" 