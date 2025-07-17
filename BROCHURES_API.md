# 📄 Brochures API Documentation

This document describes the brochures functionality that has been added to your KWSG Strapi API. Brochures are linked to projects by project name and can be accessed through the Single Project GET endpoint.

## 🚀 Quick Start

### 1. Create Database Table
```bash
./run-brochures-migration.sh
```

### 2. Import Brochure Data from CSV
```bash
node import-brochures-from-csv.js your-brochures.csv
```

### 3. Deploy to Cloud
Deploy your updated Strapi application to include the new brochures functionality.

## 📊 Database Schema

The `brochures` table has the following structure:

```sql
CREATE TABLE brochures (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR NOT NULL,
  brochure_url VARCHAR NOT NULL,
  brochure_title VARCHAR,
  description TEXT,
  file_type VARCHAR DEFAULT 'pdf',
  file_size INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_brochures_project_name ON brochures(project_name);
CREATE INDEX idx_brochures_is_active ON brochures(is_active);
```

## 🔗 API Endpoints

### 1. Get All Brochures
**GET** `/api/brochures`

Returns all active brochures.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "project_name": "Marina Bay Residences",
      "brochure_url": "https://example.com/brochure1.pdf",
      "brochure_title": "Marina Bay Residences Brochure",
      "description": "Comprehensive guide to Marina Bay Residences",
      "file_type": "pdf",
      "file_size": 2048576,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Brochures by Project Name
**GET** `/api/brochures/project/:projectName`

Returns all brochures for a specific project.

**Example:**
```
GET /api/brochures/project/Marina Bay Residences
```

### 3. Create New Brochure
**POST** `/api/brochures`

**Request Body:**
```json
{
  "project_name": "Marina Bay Residences",
  "brochure_url": "https://example.com/brochure.pdf",
  "brochure_title": "Marina Bay Residences Brochure",
  "description": "Comprehensive guide to Marina Bay Residences",
  "file_type": "pdf",
  "file_size": 2048576
}
```

### 4. Update Brochure
**PUT** `/api/brochures/:id`

### 5. Delete Brochure (Soft Delete)
**DELETE** `/api/brochures/:id`

Sets `is_active` to `false` instead of actually deleting the record.

### 6. Test Database Connection
**GET** `/api/brochures/test`

Returns database connection status and table information.

## 🔗 Integration with Projects API

### Single Project GET Enhancement

The Single Project GET endpoint (`/api/projects/:id`) now includes brochure data:

**GET** `/api/projects/1`

**Enhanced Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Marina Bay Residences",
    "location": "Marina Bay",
    "price": "SGD 2,500,000",
    // ... other project fields
    "images": [...],
    "facilities": [...],
    "features": [...],
    "developer": {...},
    "nearbyAmenities": [...],
    "similarProjects": [...],
    "floorPlans": [...],
    "unitAvailability": [...],
    "unitTypes": [...],
    "brochures": [
      {
        "id": 1,
        "project_name": "Marina Bay Residences",
        "brochure_url": "https://example.com/brochure1.pdf",
        "brochure_title": "Marina Bay Residences Brochure",
        "description": "Comprehensive guide to Marina Bay Residences",
        "file_type": "pdf",
        "file_size": 2048576,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 📁 CSV Import Format

Your CSV file should have the following columns:

| Column Name | Required | Description | Example |
|-------------|----------|-------------|---------|
| `projectName` | Yes | Project name (must match existing project names) | "Marina Bay Residences" |
| `brochureUrl` | Yes | URL to the brochure file | "https://example.com/brochure.pdf" |
| `brochureTitle` | No | Title of the brochure | "Marina Bay Residences Brochure" |
| `description` | No | Description of the brochure | "Comprehensive guide to Marina Bay Residences" |
| `fileType` | No | File type (defaults to "pdf") | "pdf" |
| `fileSize` | No | File size in bytes | 2048576 |

### Alternative Column Names

The import script supports multiple column name variations:

- `projectName`, `project_name`, `name`
- `brochureUrl`, `brochure_url`, `url`
- `brochureTitle`, `brochure_title`, `title`
- `description`, `desc`
- `fileType`, `file_type`
- `fileSize`, `file_size`

### Example CSV File

```csv
projectName,brochureUrl,brochureTitle,description,fileType,fileSize
Marina Bay Residences,https://example.com/marina-bay.pdf,Marina Bay Residences Brochure,Comprehensive guide to Marina Bay Residences,pdf,2048576
Orchard Residences,https://example.com/orchard.pdf,Orchard Residences Brochure,Complete guide to Orchard Residences,pdf,1536000
Sentosa Cove Villas,https://example.com/sentosa.pdf,Sentosa Cove Villas Brochure,Luxury living in Sentosa Cove,pdf,3072000
```

## 🛠️ Setup Instructions

### Step 1: Create Database Table

Run the migration script to create the brochures table:

```bash
./run-brochures-migration.sh
```

This script will:
- Connect to your live AWS RDS database
- Create the `brochures` table with proper indexes
- Set up triggers for automatic timestamp updates

### Step 2: Import Brochure Data

Prepare your CSV file with brochure data and run:

```bash
node import-brochures-from-csv.js your-brochures.csv
```

The script will:
- Connect to your live database
- Read the CSV file
- Import brochure data, linking to projects by name
- Skip duplicates automatically
- Provide detailed import statistics

### Step 3: Deploy to Cloud

Deploy your updated Strapi application to include the new brochures functionality.

### Step 4: Test the API

Test the endpoints:

```bash
# Test brochures API
curl -X GET https://your-strapi-app.strapiapp.com/api/brochures

# Test brochures by project
curl -X GET https://your-strapi-app.strapiapp.com/api/brochures/project/Marina%20Bay%20Residences

# Test enhanced projects API
curl -X GET https://your-strapi-app.strapiapp.com/api/projects/1
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Brochures table does not exist"**
   - Run the migration script: `./run-brochures-migration.sh`

2. **"Project name not found"**
   - Ensure project names in CSV exactly match existing project names in database
   - Check for extra spaces or different casing

3. **"Database connection failed"**
   - Verify database credentials in the migration script
   - Check network connectivity to AWS RDS

4. **"CSV file not found"**
   - Ensure the CSV file path is correct
   - Check file permissions

5. **"Import script errors"**
   - Check CSV format and column names
   - Verify required fields are present

### Verification Commands:

```bash
# Check if brochures table exists
PGPASSWORD='kwpostgres' psql -h 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com' -p '5432' -U 'postgres' -d 'postgres' -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brochures');"

# Check imported brochures
PGPASSWORD='kwpostgres' psql -h 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com' -p '5432' -U 'postgres' -d 'postgres' -c "SELECT project_name, brochure_url, brochure_title FROM brochures WHERE is_active = true ORDER BY created_at DESC;"

# Check projects that have brochures
PGPASSWORD='kwpostgres' psql -h 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com' -p '5432' -U 'postgres' -d 'postgres' -c "SELECT DISTINCT project_name FROM brochures WHERE is_active = true;"
```

## 📈 Performance Considerations

- **Indexes**: The table includes indexes on `project_name` and `is_active` for fast queries
- **Soft Deletes**: Brochures are soft-deleted (is_active = false) to preserve data integrity
- **Lazy Loading**: Brochures are only loaded when requested in the Single Project GET endpoint
- **Duplicate Prevention**: The import script prevents duplicate brochures for the same project and URL

## 🔄 Data Management

### Adding New Brochures

1. **Via API:**
   ```bash
   curl -X POST https://your-strapi-app.strapiapp.com/api/brochures \
     -H "Content-Type: application/json" \
     -d '{
       "project_name": "New Project",
       "brochure_url": "https://example.com/brochure.pdf",
       "brochure_title": "New Project Brochure"
     }'
   ```

2. **Via CSV Import:**
   - Add new records to your CSV file
   - Run the import script again (it will skip existing records)

### Updating Brochures

```bash
curl -X PUT https://your-strapi-app.strapiapp.com/api/brochures/1 \
  -H "Content-Type: application/json" \
  -d '{
    "brochure_title": "Updated Brochure Title",
    "description": "Updated description"
  }'
```

### Removing Brochures

```bash
curl -X DELETE https://your-strapi-app.strapiapp.com/api/brochures/1
```

## 🎯 Best Practices

1. **File URLs**: Use HTTPS URLs for brochure files
2. **File Types**: Prefer PDF format for brochures
3. **File Sizes**: Keep files under 10MB for better performance
4. **Project Names**: Ensure exact match with existing project names
5. **Descriptions**: Provide meaningful descriptions for better SEO
6. **Regular Updates**: Keep brochure data current and accurate

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify database connectivity
3. Test with a single brochure first
4. Check the console logs for detailed error messages
5. Ensure all required fields are provided in CSV

The brochures functionality is now fully integrated with your projects API and ready for use! 