#!/bin/bash

# Brochures Migration Script for Live PostgreSQL Database
echo "🚀 Running Brochures Migration on Live Database..."

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

# Create the brochures table
echo "📊 Creating brochures table..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Create brochures table
CREATE TABLE IF NOT EXISTS brochures (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR NOT NULL,
  brochure_url VARCHAR NOT NULL,
  brochure_title VARCHAR,
  description TEXT,
  file_type VARCHAR DEFAULT 'pdf',
  file_size INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brochures_project_name ON brochures(project_name);
CREATE INDEX IF NOT EXISTS idx_brochures_is_active ON brochures(is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brochures_updated_at 
    BEFORE UPDATE ON brochures 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
EOF

if [ $? -eq 0 ]; then
    echo "✅ Brochures table created successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Deploy your updated Strapi application to the cloud"
    echo "2. Test the API endpoints:"
    echo "   - GET /api/brochures"
    echo "   - GET /api/brochures/project/:projectName"
    echo "   - GET /api/brochures/test"
    echo ""
    echo "3. Import brochure data from CSV:"
    echo "   node import-brochures-from-csv.js your-brochures.csv"
    echo ""
    echo "4. Verify the data was inserted correctly:"
    echo "   PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c 'SELECT project_name, brochure_url, brochure_title FROM brochures WHERE is_active = true ORDER BY created_at DESC;'"
else
    echo "❌ Failed to create brochures table!"
    exit 1
fi 