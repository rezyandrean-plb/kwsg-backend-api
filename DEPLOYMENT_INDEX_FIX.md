# Deployment Index Issue Fix

## 🚨 Issue Description

**Error**: `relation "project_documents_idx" already exists`

This error occurs during Strapi deployment when it tries to create an index that already exists in the database. This is a common issue when:

1. The database schema doesn't match Strapi's expected schema
2. Previous deployments created indexes that Strapi doesn't know about
3. Manual database changes were made outside of Strapi migrations

## 🔧 Solutions

### Solution 1: Run the Fix Script (Recommended)

```bash
# Make the script executable
chmod +x fix-deployment-issue.sh

# Run the fix script
./fix-deployment-issue.sh
```

### Solution 2: Manual Database Fix

Connect to your database and run:

```sql
-- Drop the existing index if it exists
DROP INDEX IF EXISTS project_documents_idx;

-- Check if required columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('document_id', 'locale', 'published_at');

-- Only create the index if columns exist
CREATE INDEX IF NOT EXISTS project_documents_idx 
ON projects (document_id, locale, published_at);
```

### Solution 3: Use the Migration

The migration file `database/migrations/008_fix_project_documents_index.js` will automatically handle this issue in future deployments.

## 📋 What the Fix Does

1. **Checks** if the `project_documents_idx` index exists
2. **Drops** the existing index if found
3. **Verifies** if required columns exist (`document_id`, `locale`, `published_at`)
4. **Creates** the index only if all required columns are present
5. **Logs** all actions for debugging

## 🚀 After Fixing

1. **Redeploy** your application
2. **Monitor** the deployment logs
3. **Verify** the application starts successfully

## 🔍 Prevention

To prevent this issue in the future:

1. **Always use migrations** for database changes
2. **Test migrations** in a staging environment first
3. **Keep database schema** in sync with Strapi's expectations
4. **Document** any manual database changes

## 📞 Support

If the issue persists:

1. Check the deployment logs for other errors
2. Verify database connectivity
3. Ensure all environment variables are set correctly
4. Contact the development team with the full error log

## ✅ Verification

After running the fix, verify the application works by:

```bash
# Test the API endpoints
curl -s "http://your-domain/api/projects" | jq '.data | length'
curl -s "http://your-domain/api/projects/1" | jq '.data.name'
```

The API should return data without errors.
