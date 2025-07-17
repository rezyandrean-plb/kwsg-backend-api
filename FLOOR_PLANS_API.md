# 🏠 Floor Plans API Documentation

This document describes the enhanced floor plans functionality that has been added to your KWSG Strapi API. Floor plans are linked to projects by project name and can be accessed through the Single Project GET endpoint.

## 🚀 Quick Start

### 1. Create/Enhance Database Table
```bash
./run-floor-plans-migration.sh
```

### 2. Import Floor Plans Data from CSV
```bash
node import-floor-plans-from-csv.js your-floor-plans.csv
```

### 3. Deploy to Cloud
Deploy your updated Strapi application to include the new floor plans functionality.

## 📊 Database Schema

The enhanced `floor_plans` table has the following structure:

```sql
CREATE TABLE floor_plans (
  id SERIAL PRIMARY KEY,
  project_id INTEGER, -- Keep for backward compatibility
  project_name VARCHAR, -- New field for project name linking
  floor_plan_id VARCHAR, -- New field from CSV
  floor_plan_type VARCHAR, -- New field from CSV
  floor_plan_name VARCHAR, -- New field from CSV
  img VARCHAR, -- New field from CSV
  unit_type VARCHAR,
  bedrooms VARCHAR,
  bathrooms VARCHAR,
  size_sqft DECIMAL(10,2),
  price VARCHAR,
  floor_plan_image VARCHAR,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_floor_plans_project_id ON floor_plans(project_id);
CREATE INDEX idx_floor_plans_project_name ON floor_plans(project_name);
CREATE INDEX idx_floor_plans_floor_plan_id ON floor_plans(floor_plan_id);
CREATE INDEX idx_floor_plans_is_available ON floor_plans(is_available);
```

## 🔗 API Endpoints

### 1. Get All Floor Plans
**GET** `/api/floor-plans`

Returns all available floor plans.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "project_name": "Marina Bay Residences",
      "floor_plan_id": "FP001",
      "floor_plan_type": "2BR",
      "floor_plan_name": "2 Bedroom Deluxe",
      "img": "https://example.com/floor-plan-1.jpg",
      "unit_type": "2BR",
      "bedrooms": "2",
      "bathrooms": "2",
      "size_sqft": 1200.50,
      "price": "SGD 2,500,000",
      "floor_plan_image": "https://example.com/floor-plan-1.jpg",
      "description": "Spacious 2-bedroom unit with city view",
      "is_available": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Floor Plans by Project Name
**GET** `/api/floor-plans/project-name/:projectName`

Returns all floor plans for a specific project.

**Example:**
```
GET /api/floor-plans/project-name/Marina Bay Residences
```

### 3. Get Floor Plans by Project ID (Legacy)
**GET** `/api/floor-plans/project/:projectId`

Returns all floor plans for a specific project by ID.

### 4. Get Floor Plans by Unit Type
**GET** `/api/floor-plans/unit-type/:unitType`

Returns all floor plans of a specific unit type.

**Example:**
```
GET /api/floor-plans/unit-type/2BR
```

### 5. Create New Floor Plan
**POST** `/api/floor-plans`

**Request Body:**
```json
{
  "project_name": "Marina Bay Residences",
  "floor_plan_id": "FP001",
  "floor_plan_type": "2BR",
  "floor_plan_name": "2 Bedroom Deluxe",
  "img": "https://example.com/floor-plan-1.jpg",
  "unit_type": "2BR",
  "bedrooms": "2",
  "bathrooms": "2",
  "size_sqft": 1200.50,
  "price": "SGD 2,500,000",
  "description": "Spacious 2-bedroom unit with city view"
}
```

### 6. Update Floor Plan
**PUT** `/api/floor-plans/:id`

### 7. Delete Floor Plan
**DELETE** `/api/floor-plans/:id`

### 8. Test Database Connection
**GET** `/api/floor-plans/test`

Returns database connection status and table information.

## 🔗 Integration with Projects API

### Single Project GET Enhancement

The Single Project GET endpoint (`/api/projects/:id`) now includes enhanced floor plans data:

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
    "floorPlans": [
      {
        "id": 1,
        "project_name": "Marina Bay Residences",
        "floor_plan_id": "FP001",
        "floor_plan_type": "2BR",
        "floor_plan_name": "2 Bedroom Deluxe",
        "img": "https://example.com/floor-plan-1.jpg",
        "unit_type": "2BR",
        "bedrooms": "2",
        "bathrooms": "2",
        "size_sqft": 1200.50,
        "price": "SGD 2,500,000",
        "floor_plan_image": "https://example.com/floor-plan-1.jpg",
        "description": "Spacious 2-bedroom unit with city view",
        "is_available": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "unitAvailability": [...],
    "unitTypes": [...],
    "brochures": [...]
  }
}
```

## 📁 CSV Import Format

Your CSV file should have the following columns:

| Column Name | Required | Description | Example |
|-------------|----------|-------------|---------|
| `img` | Yes | Image URL of the floor plan | "https://example.com/floor-plan-1.jpg" |
| `floorPlanId` | No | Unique floor plan identifier | "FP001" |
| `floorPlanType` | No | Type of floor plan | "2BR" |
| `floorPlanName` | No | Name of the floor plan | "2 Bedroom Deluxe" |
| `projectName` | Yes | Project name (must match existing project names) | "Marina Bay Residences" |

### Example CSV File

```csv
img,floorPlanId,floorPlanType,floorPlanName,projectName
https://example.com/floor-plan-1.jpg,FP001,2BR,2 Bedroom Deluxe,Marina Bay Residences
https://example.com/floor-plan-2.jpg,FP002,3BR,3 Bedroom Premium,Marina Bay Residences
https://example.com/floor-plan-3.jpg,FP003,1BR,1 Bedroom Studio,Orchard Residences
https://example.com/floor-plan-4.jpg,FP004,4BR,4 Bedroom Penthouse,Sentosa Cove Villas
```

## 🛠️ Setup Instructions

### Step 1: Create/Enhance Database Table

Run the migration script to create or enhance the floor_plans table:

```bash
./run-floor-plans-migration.sh
```

This script will:
- Connect to your live AWS RDS database
- Create the `floor_plans` table if it doesn't exist
- Add new columns to existing table if needed
- Set up proper indexes for performance
- Set up triggers for automatic timestamp updates

### Step 2: Import Floor Plans Data

Prepare your CSV file with floor plans data and run:

```bash
node import-floor-plans-from-csv.js your-floor-plans.csv
```

The script will:
- Connect to your live database
- Read the CSV file
- Import floor plans data, linking to projects by name
- Skip duplicates automatically
- Provide detailed import statistics

### Step 3: Deploy to Cloud

Deploy your updated Strapi application to include the new floor plans functionality.

### Step 4: Test the API

Test the endpoints:

```bash
# Test floor plans API
curl -X GET https://your-strapi-app.strapiapp.com/api/floor-plans

# Test floor plans by project name
curl -X GET https://your-strapi-app.strapiapp.com/api/floor-plans/project-name/Marina%20Bay%20Residences

# Test enhanced projects API
curl -X GET https://your-strapi-app.strapiapp.com/api/projects/1
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Floor plans table does not exist"**
   - Run the migration script: `./run-floor-plans-migration.sh`

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
# Check if floor_plans table exists
PGPASSWORD='kwpostgres' psql -h 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com' -p '5432' -U 'postgres' -d 'postgres' -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'floor_plans');"

# Check imported floor plans
PGPASSWORD='kwpostgres' psql -h 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com' -p '5432' -U 'postgres' -d 'postgres' -c "SELECT project_name, floor_plan_name, img FROM floor_plans WHERE is_available = true ORDER BY created_at DESC;"

# Check projects that have floor plans
PGPASSWORD='kwpostgres' psql -h 'kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com' -p '5432' -U 'postgres' -d 'postgres' -c "SELECT DISTINCT project_name FROM floor_plans WHERE is_available = true;"
```

## 📈 Performance Considerations

- **Indexes**: The table includes indexes on `project_id`, `project_name`, `floor_plan_id`, and `is_available` for fast queries
- **Soft Deletes**: Floor plans are soft-deleted (is_available = false) to preserve data integrity
- **Lazy Loading**: Floor plans are only loaded when requested in the Single Project GET endpoint
- **Duplicate Prevention**: The import script prevents duplicate floor plans for the same project and floor plan ID
- **Backward Compatibility**: Supports both project_id and project_name linking

## 🔄 Data Management

### Adding New Floor Plans

1. **Via API:**
   ```bash
   curl -X POST https://your-strapi-app.strapiapp.com/api/floor-plans \
     -H "Content-Type: application/json" \
     -d '{
       "project_name": "New Project",
       "floor_plan_id": "FP001",
       "floor_plan_type": "2BR",
       "floor_plan_name": "2 Bedroom Deluxe",
       "img": "https://example.com/floor-plan.jpg"
     }'
   ```

2. **Via CSV Import:**
   - Add new records to your CSV file
   - Run the import script again (it will skip existing records)

### Updating Floor Plans

```bash
curl -X PUT https://your-strapi-app.strapiapp.com/api/floor-plans/1 \
  -H "Content-Type: application/json" \
  -d '{
    "floor_plan_name": "Updated Floor Plan Name",
    "description": "Updated description"
  }'
```

### Removing Floor Plans

```bash
curl -X DELETE https://your-strapi-app.strapiapp.com/api/floor-plans/1
```

## 🎯 Best Practices

1. **Image URLs**: Use HTTPS URLs for floor plan images
2. **Image Formats**: Prefer JPEG or PNG formats for better compatibility
3. **Image Sizes**: Keep images under 5MB for better performance
4. **Project Names**: Ensure exact match with existing project names
5. **Floor Plan IDs**: Use unique identifiers for each floor plan
6. **Descriptions**: Provide meaningful descriptions for better SEO
7. **Regular Updates**: Keep floor plan data current and accurate

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify database connectivity
3. Test with a single floor plan first
4. Check the console logs for detailed error messages
5. Ensure all required fields are provided in CSV

## 🔄 Migration from Legacy System

The enhanced floor plans system maintains backward compatibility:

- **Existing floor plans** linked by `project_id` will continue to work
- **New floor plans** can be linked by `project_name`
- **Single Project GET** checks both `project_id` and `project_name`
- **Legacy API endpoints** remain functional

The floor plans functionality is now fully integrated with your projects API and ready for use! 