#!/bin/bash

echo "Setting up local development environment..."

# Create .tmp directory if it doesn't exist
mkdir -p .tmp

# Create a local environment file
cat > .env.local << EOF
# Local Development Environment - SQLite
USE_LOCAL_DATABASE=true
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# App Keys (same as production for consistency)
APP_KEYS=56b3d599fbf1382ef4771486dcbfc1202bf2cb96b371996b1acfb5731b6278c7
API_TOKEN_SALT=8a1d44ad1d1a5ce5af8637b964c483e637e91ca0e4d80729afd69a62ad49fe1a
ADMIN_JWT_SECRET=f539bb50563373934ce5e50566644d2a728f827709830a46351e817fc0385603
JWT_SECRET=b6ef7e3819d4bb00a41948eb1998bd745f18ccb4ae0c44abd2b47f840946aa5b
TRANSFER_TOKEN_SALT=60a3dc9079a7a0ee9c92d53d3fc079eca19e8c95dd2bec3a0b027b566c91e800
EOF

echo "Local environment file created: .env.local"
echo ""
echo "To use local development:"
echo "1. Copy .env.local to .env: cp .env.local .env"
echo "2. Restart your Strapi server: npm run develop"
echo "3. The server will use SQLite instead of PostgreSQL"
echo ""
echo "To switch back to production database:"
echo "1. Restore your original .env file"
echo "2. Restart your Strapi server" 