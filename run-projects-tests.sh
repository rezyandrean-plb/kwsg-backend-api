#!/bin/bash

echo "🚀 Running Projects API Tests"
echo "=============================="

echo ""
echo "1️⃣ Testing Projects API (Simple)"
echo "-------------------------------"
node test-projects-simple.js

echo ""
echo "2️⃣ Testing Project Details API"
echo "-------------------------------"
node test-project-details-api.js

echo ""
echo "✅ All tests completed!"
