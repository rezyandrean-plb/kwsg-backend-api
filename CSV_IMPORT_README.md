# CSV Data Import Guide

This guide explains how to import your `newlaunch.csv` data into your Strapi database.

## 📊 Data Mapping

Your CSV data has been mapped to the following database fields:

| CSV Column | Database Field | Description |
|------------|----------------|-------------|
| `projectName` | `name`, `project_name`, `title` | Project name (used in multiple fields) |
| `projectId` | Not mapped | Unique identifier (not stored) |
| `launchDate` | Part of `description` | Launch date (included in description) |
| `unitsNum` | `units`, `total_units` | Number of units in the project |
| `tenure` | `tenure` | Property tenure (99 Years, Freehold, etc.) |
| `projectArea` | Not mapped | Area classification (not in current schema) |
| `streetAddress` | `location`, `address` | Project address |
| `district` | `district` | Singapore district (D01, D02, etc.) |
| `completionDate` | `completion` | Expected completion date |
| `developer` | `developer` | Developer company name |

## 🚀 Import Options

### Option 1: Direct PostgreSQL Import (Recommended - Fastest)

**Advantages:**
- ⚡ **Fastest** - Direct database connection
- 🔒 **Secure** - No API overhead
- 📊 **Efficient** - Bulk operations
- 🔄 **Reliable** - Handles duplicates gracefully

#### Quick Start (Live Database)
```bash
# Set up environment variables for live database
source setup-db-env.sh

# Run the fastest import
node postgres-bulk-import.js
```

#### 1.1 Bulk Import (Fastest)
```bash
node postgres-bulk-import.js
```

#### 1.2 Individual Import (More Control)
```bash
node postgres-direct-import.js
```

**Live Database Configuration:**
The scripts are configured to connect to your live AWS RDS database by default:

```bash
# Live Database Settings (already configured)
DATABASE_HOST=kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=kwpostgres
DATABASE_SSL=true
```

**To override with custom settings:**
```bash
export DATABASE_HOST=your-custom-host
export DATABASE_PORT=5432
export DATABASE_NAME=your-database
export DATABASE_USERNAME=your-username
export DATABASE_PASSWORD=your-password
export DATABASE_SSL=true
```

### Option 2: Strapi API Import

1. **Get a Strapi API Token:**
   - Go to your Strapi admin panel
   - Navigate to Settings > API Tokens
   - Create a new token with "Full access" permissions
   - Copy the token

2. **Set the environment variable:**
   ```bash
   export STRAPI_TOKEN=your_token_here
   ```

3. **Run the import script:**
   ```bash
   node strapi-import.js
   ```

### Option 3: Manual Import via JSON

1. **Review the generated JSON:**
   ```bash
   cat import-projects.json
   ```

2. **Use Strapi Admin Panel:**
   - Go to Content Manager > Projects
   - Use the import feature or manually create entries

### Option 4: SQL Import (Advanced)

1. **Review the SQL script:**
   ```bash
   cat import-projects.sql
   ```

2. **Execute directly in your database** (if you have direct database access)

## 📁 Generated Files

After running the import scripts, you'll have:

- `import-projects.json` - Formatted data for manual import
- `import-projects.sql` - SQL insert statements
- `import-csv-data.js` - Basic CSV processing script
- `strapi-import.js` - Direct Strapi API import script
- `postgres-direct-import.js` - Direct PostgreSQL import (individual)
- `postgres-bulk-import.js` - Direct PostgreSQL bulk import (fastest)
- `setup-db-env.sh` - Environment setup script for live database

## ⚡ Performance Comparison

| Method | Speed | Reliability | Complexity |
|--------|-------|-------------|------------|
| **PostgreSQL Bulk Import** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **PostgreSQL Direct Import** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Strapi API Import** | ⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Manual Import** | ⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🔧 Data Transformations

The import process includes several data transformations:

1. **Slug Generation:** Project names are converted to URL-friendly slugs
2. **Date Formatting:** Dates are converted to ISO format
3. **Description Building:** Combines launch date, units, and tenure info
4. **Default Values:** Sets default values for missing fields:
   - `type`: "Residential"
   - `property_type`: "Condominium"
   - `status`: "New Launch"
   - `features`: Empty array

## 📈 Import Statistics

Your CSV contains **138 projects** with the following data:

- **Projects by District:**
  - D01 (Downtown Core): 15 projects
  - D02 (Chinatown): 8 projects
  - D03 (Queenstown): 6 projects
  - D04 (Sentosa): 8 projects
  - D05 (South West): 12 projects
  - D09 (Orchard): 8 projects
  - D10 (Tanglin): 12 projects
  - D11 (Newton): 8 projects
  - D12 (Balestier): 4 projects
  - D14 (Geylang): 6 projects
  - D15 (Katong): 12 projects
  - D16 (Bedok): 4 projects
  - D17 (Changi): 4 projects
  - D18 (Tampines): 6 projects
  - D19 (Hougang): 4 projects
  - D20 (Ang Mo Kio): 2 projects
  - D21 (Bukit Timah): 4 projects
  - D22 (Jurong): 4 projects
  - D23 (Bukit Panjang): 4 projects
  - D24 (Choa Chu Kang): 2 projects
  - D25 (Woodlands): 2 projects
  - D26 (Upper Thomson): 4 projects
  - D27 (Sembawang): 2 projects
  - D28 (Seletar): 2 projects

- **Tenure Types:**
  - 99 Years: 85 projects
  - Freehold: 45 projects
  - 999 Years: 3 projects
  - Various other tenures: 5 projects

## ⚠️ Important Notes

1. **Live Database Connection:** Scripts are configured for your live AWS RDS database
2. **SSL Required:** Live database requires SSL connection
3. **Duplicate Handling:** All scripts handle duplicates gracefully (skip existing projects)
4. **Error Handling:** Failed imports are logged but don't stop the process
5. **Data Validation:** Review the generated data before importing
6. **Backup:** Always backup your database before large imports

## 🛠️ Troubleshooting

### Common Issues:

1. **"Database connection failed"**
   - Run `source setup-db-env.sh` to set environment variables
   - Check if your IP is whitelisted in AWS RDS security groups
   - Verify database credentials
   - Ensure SSL is enabled

2. **"Projects table does not exist"**
   - Make sure Strapi has been deployed to production
   - Run Strapi migrations if needed
   - Check if you're connecting to the right database

3. **"SSL connection failed"**
   - Ensure `DATABASE_SSL=true` is set
   - Check if `DATABASE_SSL_REJECT_UNAUTHORIZED=false` is set

4. **"No Strapi token provided"**
   - Set the STRAPI_TOKEN environment variable
   - Make sure the token has full access permissions

5. **"CSV file not found"**
   - Make sure `newlaunch.csv` is in the same directory
   - Check file permissions

### Getting Help:

- Check the console output for detailed error messages
- Review the generated JSON file to verify data mapping
- Test with a single project first before bulk import

## 📝 Next Steps

After successful import:

1. **Verify Data:** Check the Strapi admin panel to ensure all projects were imported correctly
2. **Add Missing Data:** Fill in missing fields like prices, bedrooms, bathrooms, etc.
3. **Upload Images:** Add project images through the admin panel
4. **Test API:** Verify your API endpoints return the imported data
5. **Update Frontend:** Ensure your frontend can display the new data

## 🔄 Re-importing

If you need to re-import the data:

1. **Clear existing data** (if needed):
   ```bash
   # Via PostgreSQL
   DELETE FROM projects;
   
   # Or via Strapi admin panel
   ```

2. **Run the import script again:**
   ```bash
   # For fastest re-import
   node postgres-bulk-import.js
   ```

## 🎯 Recommended Approach

For your 138 projects, I recommend:

1. **First time:** Use `postgres-bulk-import.js` for fastest import
2. **Updates:** Use `postgres-direct-import.js` for individual updates
3. **Development:** Use `strapi-import.js` for testing with smaller datasets

## 🚀 Quick Start Commands

```bash
# 1. Set up environment (one time)
source setup-db-env.sh

# 2. Run the fastest import
node postgres-bulk-import.js

# 3. Verify in Strapi admin panel
```

---

**Note:** This import process is designed for your specific CSV structure and database schema. If you modify either, you'll need to update the mapping functions in the scripts. 