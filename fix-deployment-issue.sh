#!/bin/bash

# Fix deployment index issue script
# This script fixes the "project_documents_idx already exists" error

echo "🔧 Fixing deployment index issue..."

# Set database environment variables
export DATABASE_HOST="kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com"
export DATABASE_PORT="5432"
export DATABASE_NAME="kwsg"
export DATABASE_USERNAME="postgres"
export DATABASE_PASSWORD="kwpostgres"

# Run the fix script
echo "📋 Running index fix script..."
node fix-production-index-issue.js

if [ $? -eq 0 ]; then
    echo "✅ Index issue fixed successfully!"
    echo "🚀 You can now redeploy your application"
else
    echo "❌ Failed to fix index issue"
    exit 1
fi
