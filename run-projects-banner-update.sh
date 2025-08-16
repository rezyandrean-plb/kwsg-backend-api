#!/bin/bash

# Script to update projects banner URLs from CSV file
# Usage: ./run-projects-banner-update.sh [csv_file_path]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default CSV file path
CSV_FILE=${1:-"banner_url.csv"}

echo -e "${BLUE}=== Projects Banner URL Update Script ===${NC}"
echo -e "${BLUE}CSV File: ${CSV_FILE}${NC}"
echo ""

# Check if CSV file exists
if [ ! -f "$CSV_FILE" ]; then
    echo -e "${RED}❌ Error: CSV file not found: $CSV_FILE${NC}"
    echo -e "${YELLOW}Please provide the correct path to the CSV file${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if required npm packages are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing required npm packages...${NC}"
    npm install
fi

# Check if the update script exists
if [ ! -f "update-projects-banner-urls.js" ]; then
    echo -e "${RED}❌ Error: update-projects-banner-urls.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Run the update script
echo -e "${BLUE}🚀 Starting banner URL update process...${NC}"
echo ""

node update-projects-banner-urls.js "$CSV_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Banner URL update completed successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Banner URL update failed!${NC}"
    exit 1
fi

