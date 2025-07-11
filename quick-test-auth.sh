#!/bin/bash

# Quick Manual Test with Authentication
# Replace YOUR_APP_URL and YOUR_API_TOKEN with your actual values

YOUR_APP_URL="https://striking-hug-052e89dfad.strapiapp.com/api"
YOUR_API_TOKEN="your-api-token-here"

echo "🔐 Quick Authentication Test"
echo "=========================="
echo ""

echo "1. Testing GET /press-articles with authentication:"
curl -s -H "Authorization: Bearer $YOUR_API_TOKEN" "$YOUR_APP_URL/press-articles" | jq '.data | length' 2>/dev/null || curl -s -H "Authorization: Bearer $YOUR_API_TOKEN" "$YOUR_APP_URL/press-articles"
echo ""
echo ""

echo "2. Testing GET /press-articles/slug/... with authentication:"
curl -s -H "Authorization: Bearer $YOUR_API_TOKEN" "$YOUR_APP_URL/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model" | jq '.data.title' 2>/dev/null || curl -s -H "Authorization: Bearer $YOUR_API_TOKEN" "$YOUR_APP_URL/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model"
echo ""
echo ""

echo "✅ Quick test completed!"
echo ""
echo "📝 Instructions:"
echo "1. Replace YOUR_APP_URL with your actual Strapi Cloud URL"
echo "2. Replace YOUR_API_TOKEN with your actual API token"
echo "3. Run this script again" 