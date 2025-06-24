#!/bin/bash

# Database Seed Script Runner
# This script helps you run the seed data in your PostgreSQL database

echo "=== KWSG Strapi API Database Seed Script ==="
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found. Please install PostgreSQL client tools."
    echo "   You can still run the script manually in pgAdmin using the seed-data.sql file."
    exit 1
fi

# Get database connection details
echo "Please enter your database connection details:"
read -p "Database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Database name: " DB_NAME
if [ -z "$DB_NAME" ]; then
    echo "❌ Error: Database name is required"
    exit 1
fi

read -p "Database username: " DB_USER
if [ -z "$DB_USER" ]; then
    echo "❌ Error: Database username is required"
    exit 1
fi

read -s -p "Database password: " DB_PASSWORD
echo ""

# Confirm before proceeding
echo ""
echo "About to run seed script with the following details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo ""

read -p "Do you want to proceed? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Seed script cancelled."
    exit 0
fi

# Run the seed script
echo ""
echo "🔄 Running seed script..."
echo ""

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/seed-data.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed script completed successfully!"
    echo ""
    echo "You can now test your API endpoints:"
    echo "  - GET /api/projects - List all projects"
    echo "  - GET /api/projects/1 - Get detailed project info"
    echo "  - GET /api/projects/location/Cheras - Get projects by location"
    echo ""
else
    echo ""
    echo "❌ Seed script failed. Please check the error messages above."
    echo ""
    echo "Common solutions:"
    echo "  1. Make sure your database exists and is accessible"
    echo "  2. Ensure your user has INSERT permissions"
    echo "  3. Check that all required tables exist (run Strapi first)"
    echo "  4. Try running the script manually in pgAdmin"
    echo ""
fi 