#!/bin/bash

# Floor Plans Migration Script for Live PostgreSQL Database
echo "🚀 Running Floor Plans Migration on Live Database..."

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
echo "📊 Running migration..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Check if floor_plans table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'floor_plans') THEN
        -- Create floor_plans table if it doesn't exist
        CREATE TABLE floor_plans (
            id SERIAL PRIMARY KEY,
            project_id INTEGER,
            project_name VARCHAR,
            floor_plan_id VARCHAR,
            floor_plan_type VARCHAR,
            floor_plan_name VARCHAR,
            img VARCHAR,
            unit_type VARCHAR,
            bedrooms VARCHAR,
            bathrooms VARCHAR,
            size_sqft DECIMAL(10,2),
            price VARCHAR,
            floor_plan_image VARCHAR,
            description TEXT,
            is_available BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add indexes for better performance
        CREATE INDEX idx_floor_plans_project_id ON floor_plans(project_id);
        CREATE INDEX idx_floor_plans_project_name ON floor_plans(project_name);
        CREATE INDEX idx_floor_plans_floor_plan_id ON floor_plans(floor_plan_id);
        CREATE INDEX idx_floor_plans_is_available ON floor_plans(is_available);
        
        RAISE NOTICE 'Created floor_plans table';
    ELSE
        -- Add new columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'floor_plans' AND column_name = 'project_name') THEN
            ALTER TABLE floor_plans ADD COLUMN project_name VARCHAR;
            RAISE NOTICE 'Added project_name column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'floor_plans' AND column_name = 'floor_plan_id') THEN
            ALTER TABLE floor_plans ADD COLUMN floor_plan_id VARCHAR;
            RAISE NOTICE 'Added floor_plan_id column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'floor_plans' AND column_name = 'floor_plan_type') THEN
            ALTER TABLE floor_plans ADD COLUMN floor_plan_type VARCHAR;
            RAISE NOTICE 'Added floor_plan_type column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'floor_plans' AND column_name = 'floor_plan_name') THEN
            ALTER TABLE floor_plans ADD COLUMN floor_plan_name VARCHAR;
            RAISE NOTICE 'Added floor_plan_name column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'floor_plans' AND column_name = 'img') THEN
            ALTER TABLE floor_plans ADD COLUMN img VARCHAR;
            RAISE NOTICE 'Added img column';
        END IF;
        
        -- Add indexes for new columns if they don't exist
        CREATE INDEX IF NOT EXISTS idx_floor_plans_project_name ON floor_plans(project_name);
        CREATE INDEX IF NOT EXISTS idx_floor_plans_floor_plan_id ON floor_plans(floor_plan_id);
        
        RAISE NOTICE 'Enhanced existing floor_plans table';
    END IF;
END $$;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_floor_plans_updated_at ON floor_plans;
CREATE TRIGGER update_floor_plans_updated_at 
    BEFORE UPDATE ON floor_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
EOF

if [ $? -eq 0 ]; then
    echo "✅ Floor plans migration completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Deploy your updated Strapi application to the cloud"
    echo "2. Test the API endpoints:"
    echo "   - GET /api/floor-plans"
    echo "   - GET /api/floor-plans/project-name/:projectName"
    echo "   - GET /api/floor-plans/test"
    echo ""
    echo "3. Import floor plans data from CSV:"
    echo "   node import-floor-plans-from-csv.js your-floor-plans.csv"
    echo ""
    echo "4. Verify the data was inserted correctly:"
    echo "   PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c 'SELECT project_name, floor_plan_name, img FROM floor_plans WHERE is_available = true ORDER BY created_at DESC;'"
else
    echo "❌ Failed to run floor plans migration!"
    exit 1
fi 