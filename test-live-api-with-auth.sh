#!/bin/bash

# Test Script for Live Press Articles API with Authentication
# Update the BASE_URL and API_TOKEN with your actual values

BASE_URL="https://striking-hug-052e89dfad.strapiapp.com/api"  # Replace with your actual URL
API_TOKEN="your-api-token-here"  # Replace with your actual API token

echo "🧪 Testing Live Press Articles API with Authentication..."
echo "📍 Testing against: $BASE_URL"
echo "🔑 Using API Token: ${API_TOKEN:0:10}..."
echo ""

# Function to make authenticated requests
make_request() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="${3:-}"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $API_TOKEN" \
            "$BASE_URL$endpoint"
    fi
}

# Test 1: Get all press articles
echo "1. Testing GET /press-articles"
response=$(make_request "/press-articles")
echo "$response" | jq '.data | length' 2>/dev/null || echo "$response"
echo ""
echo ""

# Test 2: Get article by slug
echo "2. Testing GET /press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model"
response=$(make_request "/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model")
echo "$response" | jq '.data.title' 2>/dev/null || echo "$response"
echo ""
echo ""

# Test 3: Get articles by year
echo "3. Testing GET /press-articles/year/2025"
response=$(make_request "/press-articles/year/2025")
echo "$response" | jq '.data | length' 2>/dev/null || echo "$response"
echo ""
echo ""

# Test 4: Get articles by source
echo "4. Testing GET /press-articles/source/Tech Coffee House"
response=$(make_request "/press-articles/source/Tech Coffee House")
echo "$response" | jq '.data | length' 2>/dev/null || echo "$response"
echo ""
echo ""

# Test 5: Search articles
echo "5. Testing GET /press-articles/search?query=KW Singapore"
response=$(make_request "/press-articles/search?query=KW Singapore")
echo "$response" | jq '.data | length' 2>/dev/null || echo "$response"
echo ""
echo ""

# Test 6: Create a test article
echo "6. Testing POST /press-articles"
test_article='{
    "title": "Test Article - Live API",
    "description": "This is a test article for live API testing",
    "imageUrl": "https://example.com/test-image.jpg",
    "link": "https://example.com/test-article",
    "date": "2025-01-01",
    "year": "2025",
    "source": "Test Source",
    "slug": "test-article-live-api",
    "articleContent": "<div>Test content for live API</div>"
}'

response=$(make_request "/press-articles" "POST" "$test_article")
created_id=$(echo "$response" | jq '.data.id' 2>/dev/null)
echo "$response" | jq '.data.title' 2>/dev/null || echo "$response"
echo ""
echo ""

# Test 7: Update the test article (if created successfully)
if [ "$created_id" != "null" ] && [ "$created_id" != "" ]; then
    echo "7. Testing PUT /press-articles/$created_id"
    update_data='{
        "title": "Updated Test Article - Live API",
        "description": "This is an updated test article for live API testing"
    }'
    
    response=$(make_request "/press-articles/$created_id" "PUT" "$update_data")
    echo "$response" | jq '.data.title' 2>/dev/null || echo "$response"
    echo ""
    echo ""
    
    # Test 8: Delete the test article
    echo "8. Testing DELETE /press-articles/$created_id"
    response=$(make_request "/press-articles/$created_id" "DELETE")
    echo "$response" | jq '.data.deleted' 2>/dev/null || echo "$response"
    echo ""
    echo ""
fi

echo "✅ Authentication tests completed!"
echo ""
echo "💡 If you still get errors:"
echo "   - Check if your API token is correct"
echo "   - Verify the BASE_URL is correct"
echo "   - Make sure the database migration has been run"
echo ""
echo "🔧 To get your API token:"
echo "   1. Go to https://your-app-name.strapiapp.com/admin"
echo "   2. Settings → API Tokens → Create new token"
echo "   3. Copy the token and update this script" 