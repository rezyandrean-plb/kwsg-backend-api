#!/bin/bash

# Press Articles Migration Script for Live PostgreSQL Database
echo "🚀 Running Press Articles Migration on Live Database..."

# Database connection details (update these with your actual values)
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
echo "📊 Running migration..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/001_create_press_articles_table.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Deploy your updated Strapi application to the cloud"
    echo "2. Test the API endpoints:"
    echo "   - GET /api/press-articles"
    echo "   - GET /api/press-articles/1"
    echo "   - GET /api/press-articles/slug/kw-singapore-debuts-with-10m-valuation-pledges-to-disrupt-property-agency-model"
    echo ""
    echo "3. Verify the data was inserted correctly:"
    echo "   PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c 'SELECT title, source, date FROM press_articles ORDER BY date DESC;'"
else
    echo "❌ Migration failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi 