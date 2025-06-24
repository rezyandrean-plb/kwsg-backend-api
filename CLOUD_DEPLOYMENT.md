# 🚀 Strapi Cloud Deployment Guide

This guide will help you deploy your KWSG Strapi API to Strapi Cloud while maintaining connection to your AWS RDS database.

## 📋 Prerequisites

1. **Strapi Cloud Account**: Sign up at [cloud.strapi.io](https://cloud.strapi.io)
2. **Strapi CLI**: Install globally with `npm install -g @strapi/cli`
3. **Git Repository**: Your code should be in a Git repository
4. **AWS RDS Database**: Your current database should be accessible from Strapi Cloud

## 🔧 Configuration Changes Made

### 1. Database Configuration
- Updated `config/database.ts` with better SSL handling for cloud environments
- Added connection pooling optimizations
- Set `DATABASE_SSL_REJECT_UNAUTHORIZED=false` for AWS RDS compatibility

### 2. Server Configuration
- Updated `config/server.ts` with cloud-friendly settings
- Added proper CORS and security configurations

### 3. Cloud Configuration
- Created `.strapi/cloud.json` for Strapi Cloud settings
- Added deployment scripts and templates

## 🌐 AWS RDS Security Group Configuration

**IMPORTANT**: Your AWS RDS instance must allow connections from Strapi Cloud's IP ranges.

1. Go to AWS RDS Console
2. Select your database instance
3. Go to "Connectivity & security" → "VPC security groups"
4. Add inbound rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: `0.0.0.0/0` (or Strapi Cloud IP ranges if available)

## 🔑 Environment Variables Setup

### In Strapi Cloud Dashboard:

1. Go to your project in Strapi Cloud
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:

```env
# App Configuration
HOST=0.0.0.0
PORT=1337
PUBLIC_URL=https://your-app-name.strapiapp.com
IS_PROXIED=true

# Security Keys (Generate new ones!)
APP_KEYS=your-app-key-1,your-app-key-2,your-app-key-3,your-app-key-4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# Database Configuration (Your AWS RDS)
DATABASE_CLIENT=postgres
DATABASE_HOST=kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=kwpostgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false

# Database Pool Configuration
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=60000
DATABASE_IDLE_TIMEOUT=30000
DATABASE_REAP_INTERVAL=1000
DATABASE_CREATE_RETRY_INTERVAL=200

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com,http://localhost:3000

# Cloud-specific settings
CRON_ENABLED=false
WEBHOOKS_POPULATE_RELATIONS=false
```

## 🚀 Deployment Steps

### Option 1: Using the Deployment Script
```bash
./deploy-to-cloud.sh
```

### Option 2: Manual Deployment
```bash
# 1. Login to Strapi Cloud
strapi cloud login

# 2. Build the application
npm run build

# 3. Deploy to Strapi Cloud
strapi cloud deploy
```

## 🔍 Post-Deployment Verification

1. **Check Application Status**: Visit your Strapi Cloud URL
2. **Test Database Connection**: Verify data is loading correctly
3. **Check Admin Panel**: Access `/admin` to ensure it's working
4. **Test API Endpoints**: Verify your API endpoints are responding

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check AWS RDS security group settings
   - Verify database credentials in environment variables
   - Ensure SSL settings are correct

2. **Build Failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check Node.js version compatibility

3. **Environment Variables Not Loading**
   - Ensure all variables are set in Strapi Cloud dashboard
   - Check for typos in variable names
   - Verify sensitive data is properly escaped

## 📞 Support

- **Strapi Cloud Documentation**: [docs.strapi.io/cloud](https://docs.strapi.io/cloud)
- **Strapi Community**: [forum.strapi.io](https://forum.strapi.io)
- **GitHub Issues**: Report bugs in your repository

## 🔄 Continuous Deployment

To enable automatic deployments:

1. Connect your Git repository to Strapi Cloud
2. Configure branch-based deployments
3. Set up webhooks for automatic builds

---

**Note**: Keep your database credentials secure and never commit them to version control! 