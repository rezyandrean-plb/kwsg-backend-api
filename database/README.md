# Database Seed Data

This directory contains SQL scripts to populate your PostgreSQL database with dummy data for testing the KWSG Strapi API.

## Files

- `create-tables.sql` - Creates the missing tables that the controller expects
- `seed-data.sql` - Comprehensive seed data for all tables (Singapore-based)
- `README.md` - This file with instructions
- `run-seed.sh` - Shell script to run the seed data from command line

## Prerequisites

Before running the seed data, you need to create the missing tables that the controller expects. The controller uses raw SQL queries to access tables that don't exist as Strapi content types.

### Step 1: Create Missing Tables

First, run the table creation script:

#### In pgAdmin:
1. **Open pgAdmin** and connect to your PostgreSQL database
2. **Navigate to your database** in the left sidebar
3. **Right-click on your database** and select "Query Tool"
4. **Open the `create-tables.sql` file** and copy all content
5. **Paste the SQL content** into the Query Tool
6. **Click "Execute"** to create the missing tables

#### From Command Line:
```bash
# Run the table creation script
psql -h localhost -U your_username -d your_database_name -f database/create-tables.sql
```

### Step 2: Run Seed Data

After creating the tables, you can run the seed data script.

## How to Use in pgAdmin

### Method 1: Using pgAdmin Query Tool

1. **Open pgAdmin** and connect to your PostgreSQL database
2. **Navigate to your database** in the left sidebar
3. **Right-click on your database** and select "Query Tool"
4. **Open the seed-data.sql file** in a text editor and copy all content
5. **Paste the SQL content** into the Query Tool
6. **Click the "Execute" button** (or press F5) to run the script

### Method 2: Using pgAdmin File Import

1. **Open pgAdmin** and connect to your PostgreSQL database
2. **Navigate to your database** in the left sidebar
3. **Right-click on your database** and select "Query Tool"
4. **Click the "Open File" button** (folder icon) in the Query Tool
5. **Select the `seed-data.sql` file** from this directory
6. **Click "Execute"** to run the script

### Method 3: Using Command Line (if you have psql installed)

```bash
# Navigate to your project directory
cd /path/to/your/kwsg-strapi-api

# Run the seed script
psql -h localhost -U your_username -d your_database_name -f database/seed-data.sql
```

### Method 4: Using the Shell Script

```bash
# Make the script executable (if not already)
chmod +x database/run-seed.sh

# Run the script
./database/run-seed.sh
```

## What Data is Included

The seed script includes dummy data for:

### Core Tables
- **Projects** (8 projects) - Main property developments in Singapore
- **Developers** (5 developers) - Singapore property development companies
- **Facilities** (10 facilities) - Amenities available in projects
- **Features** (10 features) - Unit features and specifications

### Related Tables
- **Project Images** - Multiple images per project (using Unsplash URLs)
- **Project Facilities** - Junction table linking projects to facilities
- **Project Features** - Junction table linking projects to features
- **Nearby Amenities** - Local amenities near projects
- **Similar Projects** - Related project recommendations
- **Floor Plans** - Unit layout plans
- **Unit Availability** - Current availability status
- **Unit Types** - Different unit configurations

## Data Highlights

### Projects Included:
1. **Marina Bay Residences** - Luxury condominium in Marina Bay
2. **Orchard Residences** - Urban living in Orchard Road
3. **Sentosa Cove Villas** - Exclusive island living in Sentosa Cove
4. **Punggol Waterway Terraces** - Waterfront living in Punggol
5. **Tanjong Pagar Centre** - Mixed-use development in CBD
6. **Woodleigh Residences** - Connected living in Bidadari
7. **One Raffles Place** - Premium office space in Raffles Place
8. **The Interlace** - Innovative living in Alexandra

### Developers:
- CapitaLand Development
- Frasers Property
- City Developments Limited (CDL)
- Keppel Land
- GuocoLand

### Price Range:
- From SGD 950,000 to SGD 15,000,000
- Various property types (Condominium, Serviced Apartment, Office Tower, Mixed Development)
- Different completion dates (2024-2025)
- All properties are 99-year Leasehold (Singapore standard)

### Singapore Locations:
- Marina Bay (CBD)
- Orchard Road (Shopping District)
- Sentosa Cove (Exclusive Island)
- Punggol (New Town)
- Tanjong Pagar (CBD)
- Bidadari (New Town)
- Raffles Place (Financial District)
- Alexandra (Mature Estate)

## Important Notes

1. **Create Tables First**: Always run `create-tables.sql` before `seed-data.sql`
2. **Backup First**: Always backup your database before running seed scripts
3. **Clear Existing Data**: The script includes commented TRUNCATE statements - uncomment if you want to clear existing data first
4. **Sequence Reset**: The script automatically resets auto-increment sequences
5. **Timestamps**: All records include proper created_at and updated_at timestamps
6. **Foreign Keys**: All relationships are properly maintained
7. **Singapore Context**: All data is Singapore-based with appropriate locations, developers, and SGD pricing
8. **Real Images**: All project images use real Unsplash URLs for better visual representation

## Troubleshooting

### Common Issues:

1. **Table Doesn't Exist**: Make sure you've run `create-tables.sql` first
2. **Permission Denied**: Make sure your database user has INSERT permissions
3. **Foreign Key Violations**: Ensure all referenced tables exist before running
4. **Sequence Errors**: The script handles sequence resets automatically
5. **Duplicate Key Errors**: Clear existing data first if needed

### If Tables Don't Exist:

If you get errors about missing tables:

1. **First run the table creation script**:
   ```bash
   psql -h localhost -U your_username -d your_database_name -f database/create-tables.sql
   ```

2. **Then run the seed data script**:
   ```bash
   psql -h localhost -U your_username -d your_database_name -f database/seed-data.sql
   ```

### If Strapi Tables Don't Exist:

If you get errors about Strapi tables (like `projects`), you may need to run Strapi migrations first:

```bash
# In your Strapi project directory
npm run strapi develop
# or
yarn strapi develop
```

This will create the necessary tables based on your content types.

## Customization

You can modify the `seed-data.sql` file to:
- Add more Singapore projects
- Change property details
- Modify pricing in SGD
- Add different Singapore locations
- Include more developers or facilities

## Verification

After running the script, you can verify the data by:

1. **Checking record counts** in each table
2. **Testing API endpoints** in your Strapi application
3. **Running the summary queries** at the end of the script

The script includes summary queries that will show you how many records were inserted into each table.

## Singapore-Specific Features

- **Currency**: All prices in Singapore Dollars (SGD)
- **Tenure**: 99-year Leasehold (standard in Singapore)
- **Green Building**: BCA Green Mark certification (Singapore standard)
- **Transportation**: MRT stations and bus interchanges
- **Healthcare**: Singapore hospitals and polyclinics
- **Shopping**: Major Singapore malls and retail centers
- **Images**: Real Unsplash images for all projects and floor plans 