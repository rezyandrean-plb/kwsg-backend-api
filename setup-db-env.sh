#!/bin/bash

# Database Environment Setup Script
# This script sets up environment variables for connecting to the live database

echo "🔧 Setting up database environment variables for live database..."

# Live Database Configuration
export DATABASE_HOST=kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com
export DATABASE_PORT=5432
export DATABASE_NAME=postgres
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=kwpostgres
export DATABASE_SSL=true
export DATABASE_SSL_REJECT_UNAUTHORIZED=false

# Connection pool settings
export DATABASE_CONNECTION_TIMEOUT=60000
export DATABASE_IDLE_TIMEOUT=30000
export DATABASE_REAP_INTERVAL=1000
export DATABASE_CREATE_RETRY_INTERVAL=200

echo "✅ Database environment variables set:"
echo "   Host: $DATABASE_HOST"
echo "   Port: $DATABASE_PORT"
echo "   Database: $DATABASE_NAME"
echo "   Username: $DATABASE_USERNAME"
echo "   SSL: $DATABASE_SSL"
echo ""
echo "🚀 You can now run the import scripts:"
echo "   node postgres-bulk-import.js    (fastest)"
echo "   node postgres-direct-import.js  (individual)"
echo ""
echo "💡 To use these settings in a new terminal, run:"
echo "   source setup-db-env.sh" 