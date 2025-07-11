#!/bin/bash

echo "🔍 Checking Press Articles API Deployment Status..."
echo "=================================================="

# Test basic connectivity
echo "1. Testing basic connectivity..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "https://striking-hug-052e89dfad.strapiapp.com/"

# Test projects API (should work)
echo ""
echo "2. Testing projects API (should work)..."
curl -s -X GET "https://striking-hug-052e89dfad.strapiapp.com/api/projects" -H "Content-Type: application/json" | jq '.data | length' 2>/dev/null || echo "Projects API response received"

# Test press articles API
echo ""
echo "3. Testing press articles API..."
curl -s -X GET "https://striking-hug-052e89dfad.strapiapp.com/api/press-articles" -H "Content-Type: application/json"

echo ""
echo "4. Testing press articles with different headers..."
curl -s -X GET "https://striking-hug-052e89dfad.strapiapp.com/api/press-articles" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "User-Agent: Mozilla/5.0"

echo ""
echo "5. Testing with OPTIONS method..."
curl -s -X OPTIONS "https://striking-hug-052e89dfad.strapiapp.com/api/press-articles" \
  -H "Content-Type: application/json"

echo ""
echo "6. Checking if the endpoint exists at all..."
curl -s -I "https://striking-hug-052e89dfad.strapiapp.com/api/press-articles"

echo ""
echo "=================================================="
echo "📋 Summary:"
echo "- If you see 403 Forbidden, the API exists but has authentication issues"
echo "- If you see 404 Not Found, the API hasn't been deployed yet"
echo "- If you see other errors, there might be a deployment issue"
echo ""
echo "🔄 Next Steps:"
echo "1. Wait 5-10 minutes for deployment to complete"
echo "2. Check Strapi Cloud dashboard for deployment status"
echo "3. Verify the Git repository is connected to Strapi Cloud"
echo "4. Check if there are any build errors in the deployment logs" 