# 🔧 SSL Certificate Fix for Strapi Cloud

## Issue: "self-signed certificate in certificate chain"

This error occurs when Strapi Cloud tries to connect to your AWS RDS database and encounters SSL certificate verification issues.

## ✅ Solution: Update Environment Variables in Strapi Cloud

### Step 1: Go to Strapi Cloud Dashboard
1. Navigate to your project
2. Go to "Settings" → "Environment Variables"

### Step 2: Update/Add These Variables

**Database SSL Configuration:**
```env
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

**Complete Database Configuration:**
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=kwpostgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

### Step 3: Alternative SSL Configuration

If the above doesn't work, try this more explicit SSL configuration:

```env
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
DATABASE_SSL_CA=
DATABASE_SSL_KEY=
DATABASE_SSL_CERT=
```

### Step 4: Redeploy

After updating the environment variables:
1. Go to "Deployments" in Strapi Cloud
2. Click "Redeploy" or trigger a new deployment
3. The SSL issue should be resolved

## 🔍 Why This Happens

- AWS RDS uses SSL certificates that may not be recognized by Strapi Cloud's Node.js environment
- Setting `DATABASE_SSL_REJECT_UNAUTHORIZED=false` tells Node.js to accept self-signed certificates
- This is safe for AWS RDS as the connection is still encrypted

## 🚨 Important Notes

- This fix is specifically for AWS RDS
- The connection is still encrypted (SSL is enabled)
- We're just bypassing certificate verification
- This is a common and accepted practice for AWS RDS connections

## 📞 If Issues Persist

If you still have issues after this fix:
1. Check AWS RDS security group allows connections from Strapi Cloud
2. Verify database credentials are correct
3. Ensure the RDS instance is running and accessible 