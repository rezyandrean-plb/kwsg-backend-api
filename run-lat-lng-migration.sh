#!/bin/bash

echo "🔄 Starting Latitude/Longitude Migration Process"
echo "================================================"

# Database configuration
DB_HOST="kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="kwpostgres"
DB_NAME="postgres"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Running database migration to change lat/lng to string type...${NC}"

# Run the migration
node -e "
const knex = require('knex');

const dbConfig = {
  client: 'postgresql',
  connection: {
    host: '$DB_HOST',
    port: $DB_PORT,
    user: '$DB_USER',
    password: '$DB_PASSWORD',
    database: '$DB_NAME',
    ssl: { rejectUnauthorized: false }
  }
};

const db = knex(dbConfig);

async function runMigration() {
  try {
    const migration = require('./database/migrations/007_change_lat_lng_to_string.js');
    await migration.up(db);
    console.log('✅ Migration completed successfully');
    await db.destroy();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await db.destroy();
    process.exit(1);
  }
}

runMigration();
"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed! Exiting.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migration completed successfully!${NC}"

echo -e "${BLUE}Step 2: Re-importing latitude and longitude data from CSV...${NC}"

# Run the re-import script
node reimport-lat-lng-from-csv.js

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Re-import failed! Exiting.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Latitude/Longitude migration and re-import completed successfully!${NC}"

echo -e "${BLUE}Step 3: Verifying the changes...${NC}"

# Run verification
node verify-lat-lng-changes.js

echo -e "${GREEN}🎉 All done! Latitude and longitude are now string type with fresh data from CSV.${NC}"
