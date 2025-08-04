#!/bin/bash

# Script to run the projects banner migration
echo "🚀 Starting projects banner migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if the migration file exists
if [ ! -f "database/migrations/006_add_image_url_banner_to_projects.js" ]; then
    echo "❌ Error: Migration file not found: database/migrations/006_add_image_url_banner_to_projects.js"
    exit 1
fi

echo "📁 Migration file found"

# Create a temporary script to run the migration
cat > temp_migration_runner.js << 'EOF'
const knex = require('knex');
const path = require('path');
require('dotenv').config();

// Database configuration
const config = {
  client: process.env.DATABASE_CLIENT || 'postgres',
  connection: process.env.DATABASE_URL || {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'strapi',
    user: process.env.DATABASE_USERNAME || 'strapi',
    password: process.env.DATABASE_PASSWORD || 'strapi',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: parseInt(process.env.DATABASE_POOL_MIN) || 1,
    max: parseInt(process.env.DATABASE_POOL_MAX) || 3,
  },
};

async function runMigration() {
  const db = knex(config);
  
  try {
    console.log('🔌 Connecting to database...');
    
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Import and run the migration
    const migration = require('./database/migrations/006_add_image_url_banner_to_projects.js');
    
    console.log('🔄 Running migration...');
    await migration.up(db);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the column was added
    const hasColumn = await db.schema.hasColumn('projects', 'image_url_banner');
    if (hasColumn) {
      console.log('✅ image_url_banner column verified in projects table');
      
      // Check current values
      const projects = await db('projects').select('id', 'name', 'image_url_banner').limit(5);
      console.log('📊 Sample projects with new column:');
      projects.forEach(project => {
        console.log(`  - ID: ${project.id}, Name: ${project.name}, Banner: ${project.image_url_banner || 'NULL'}`);
      });
    } else {
      console.log('❌ Column verification failed');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigration();
EOF

echo "📝 Created temporary migration runner"

# Run the migration
echo "🔄 Executing migration..."
node temp_migration_runner.js

# Clean up
rm -f temp_migration_runner.js

echo "🎉 Migration process completed!" 