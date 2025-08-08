#!/bin/bash

# Fix press articles deployment issue script
# This script fixes the "column already exists" error for press_articles table

echo "🔧 Fixing press articles deployment issue..."

# Set database environment variables
export DATABASE_HOST="kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com"
export DATABASE_PORT="5432"
export DATABASE_NAME="kwsg"
export DATABASE_USERNAME="postgres"
export DATABASE_PASSWORD="kwpostgres"

# Run the schema analysis
echo "📋 Running press articles schema analysis..."
node fix-press-articles-schema.js

if [ $? -eq 0 ]; then
    echo "✅ Schema analysis completed successfully!"
    echo "💡 The issue is that Strapi is trying to add columns that already exist"
    echo "🔧 The schema has been updated to remove duplicate field definitions"
    echo "🚀 You can now redeploy your application"
else
    echo "❌ Schema analysis failed"
    exit 1
fi
