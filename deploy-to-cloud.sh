#!/bin/bash

# Strapi Cloud Deployment Script
echo "🚀 Preparing for Strapi Cloud deployment..."

# Check if we're in a Strapi project
if [ ! -f "package.json" ] || ! grep -q "strapi" package.json; then
    echo "❌ Not in a Strapi project directory!"
    exit 1
fi

# Check if @strapi/plugin-cloud is installed
if ! grep -q "@strapi/plugin-cloud" package.json; then
    echo "❌ @strapi/plugin-cloud not found in package.json"
    echo "Please install it: npm install @strapi/plugin-cloud"
    exit 1
fi

# Build the application
echo "📦 Building Strapi application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    echo "Please fix any build errors before deploying."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if user wants to proceed with deployment
echo ""
echo "🔍 Pre-deployment Checklist:"
echo "1. ✅ Strapi project detected"
echo "2. ✅ @strapi/plugin-cloud installed"
echo "3. ✅ Build completed successfully"
echo ""
echo "📋 Next Steps:"
echo "1. Create a Strapi Cloud account at https://cloud.strapi.io"
echo "2. Create a new project in Strapi Cloud"
echo "3. Set up environment variables in Strapi Cloud dashboard"
echo "4. Connect your Git repository"
echo ""
echo "🌐 Alternative Deployment Methods:"
echo ""
echo "Method 1: Git-based Deployment (Recommended)"
echo "  1. Push your code to GitHub/GitLab"
echo "  2. Connect your repository in Strapi Cloud"
echo "  3. Set environment variables in Strapi Cloud dashboard"
echo "  4. Deploy automatically on push"
echo ""
echo "Method 2: Manual Upload"
echo "  1. Create a new project in Strapi Cloud"
echo "  2. Upload the built files manually"
echo "  3. Configure environment variables"
echo ""
echo "Method 3: Using Strapi CLI (if available)"
echo "  1. Install Strapi CLI: npm install -g @strapi/strapi"
echo "  2. Login: strapi cloud login"
echo "  3. Deploy: strapi cloud deploy"
echo ""

# Check if Strapi CLI is available
if command -v strapi &> /dev/null; then
    echo "🔧 Strapi CLI detected. Checking version..."
    strapi --version
    
    # Check if cloud commands are available
    if strapi help | grep -q "cloud"; then
        echo ""
        echo "✅ Strapi CLI with cloud support detected!"
        echo "You can now run: strapi cloud login"
        echo "Then: strapi cloud deploy"
    else
        echo "⚠️  Strapi CLI detected but cloud commands not available"
        echo "Please update to latest version: npm install -g @strapi/strapi@latest"
    fi
else
    echo "⚠️  Strapi CLI not found globally"
    echo "You can install it with: npm install -g @strapi/strapi@latest"
fi

echo ""
echo "📁 Your project is ready for deployment!"
echo "📄 Check CLOUD_DEPLOYMENT.md for detailed instructions"
echo "📋 Use cloud-env-template.txt for environment variables" 