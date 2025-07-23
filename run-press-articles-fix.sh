#!/bin/bash

# Press Articles Database Structure Fix Script
echo "🚀 Running Press Articles Database Structure Fix..."

# Database connection details
DB_HOST="kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="kwpostgres"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) not found!"
    echo "Please install PostgreSQL client tools:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql-client"
    echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Test database connection
echo "🔍 Testing database connection..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    echo "Please check your database credentials and network connectivity."
    exit 1
fi

# Run the migration
echo "📊 Running database structure fix..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/005_fix_press_articles_structure.sql

if [ $? -eq 0 ]; then
    echo "✅ Database structure fix completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Restart your Strapi application"
    echo "2. Test the API endpoints:"
    echo "   - GET /api/press-articles"
    echo "   - PUT /api/press-articles/1"
    echo "   - POST /api/press-articles"
    echo ""
    echo "3. Verify the table structure:"
    echo "   PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c '\\d press_articles'"
else
    echo "❌ Database structure fix failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi 