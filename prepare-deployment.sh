#!/bin/bash

echo "📦 Preparing files for Strapi Cloud deployment..."

# Create deployment directory
DEPLOY_DIR="strapi-cloud-deployment"
mkdir -p $DEPLOY_DIR

# Copy essential files
echo "📁 Copying project files..."
cp -r src $DEPLOY_DIR/
cp -r config $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp -r types $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp tsconfig.json $DEPLOY_DIR/
cp .strapi-updater.json $DEPLOY_DIR/

# Create .gitignore for deployment
cat > $DEPLOY_DIR/.gitignore << EOF
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.tmp/
.cache/
build/
dist/
.strapi/
EOF

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md << EOF
# Strapi Cloud Deployment Instructions

## Files Included:
- ✅ src/ - Source code
- ✅ config/ - Configuration files
- ✅ public/ - Public assets
- ✅ types/ - TypeScript types
- ✅ package.json - Dependencies
- ✅ tsconfig.json - TypeScript config

## Next Steps:
1. Upload this folder to Strapi Cloud
2. Strapi Cloud will automatically install dependencies
3. Strapi Cloud will build the application
4. Your environment variables are already configured

## Database Connection:
Your AWS RDS database is already configured in Strapi Cloud environment variables:
- Host: kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com
- Database: postgres
- SSL: Enabled
EOF

echo "✅ Deployment package created in: $DEPLOY_DIR"
echo "📋 Instructions saved in: $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "🚀 Next Steps:"
echo "1. Upload the '$DEPLOY_DIR' folder to Strapi Cloud"
echo "2. Or push to Git repository and connect in Strapi Cloud"
echo "3. Strapi Cloud will handle the build process" 