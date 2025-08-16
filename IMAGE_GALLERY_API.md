# Image Gallery API Documentation

## Overview

The Image Gallery API allows you to manage image galleries for projects. Each image gallery entry is linked to a project via the `project_name` field, similar to how floor plans are related to projects.

## Database Schema

The `image_galleries` table contains the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | integer | Yes | Primary key (auto-increment) |
| project_name | string | Yes | References the project name for relation |
| image_title | string | Yes | Title of the image |
| image_url | string | Yes | URL of the image |
| image_description | text | No | Description of the image |
| image_category | string | No | Category (e.g., exterior, interior, amenities) |
| display_order | integer | No | Order for displaying images (default: 0) |
| is_featured | boolean | No | Whether image should be featured (default: false) |
| alt_text | string | No | Alt text for accessibility |
| image_size | string | No | Size information of the image |
| is_active | boolean | No | Whether image is active (default: true) |
| created_at | timestamp | Yes | Creation timestamp |
| updated_at | timestamp | Yes | Last update timestamp |

## API Endpoints

### 1. Get All Image Galleries
```
GET /api/image-galleries
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "project_name": "Marina Bay Residences",
      "image_title": "Exterior View - Day",
      "image_url": "https://example.com/images/marina-bay-exterior-day.jpg",
      "image_description": "Beautiful exterior view...",
      "image_category": "exterior",
      "display_order": 1,
      "is_featured": true,
      "alt_text": "Marina Bay Residences exterior view",
      "image_size": "1920x1080",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Image Gallery by ID
```
GET /api/image-galleries/:id
```

### 3. Get Images by Project Name
```
GET /api/image-galleries/project/:projectName
```

**Example:**
```
GET /api/image-galleries/project/Marina Bay Residences
```

### 4. Get Featured Images
```
GET /api/image-galleries/featured
```

### 5. Get Images by Category
```
GET /api/image-galleries/category/:category
```

**Example:**
```
GET /api/image-galleries/category/exterior
```

### 6. Create New Image Gallery
```
POST /api/image-galleries
```

**Request Body:**
```json
{
  "project_name": "Marina Bay Residences",
  "image_title": "New Image",
  "image_url": "https://example.com/images/new-image.jpg",
  "image_description": "Description of the image",
  "image_category": "interior",
  "display_order": 1,
  "is_featured": false,
  "alt_text": "Alt text for accessibility",
  "image_size": "1920x1080",
  "is_active": true
}
```

### 7. Update Image Gallery
```
PUT /api/image-galleries/:id
```

### 8. Delete Image Gallery (Soft Delete)
```
DELETE /api/image-galleries/:id
```

## Integration with Projects API

The image gallery data is automatically included in the projects API response when you fetch a specific project:

```
GET /api/projects/:id
```

**Response includes:**
```json
{
  "data": {
    "id": 1,
    "name": "Marina Bay Residences",
    // ... other project fields
    "imageGallery": [
      {
        "id": 1,
        "project_name": "Marina Bay Residences",
        "image_title": "Exterior View - Day",
        "image_url": "https://example.com/images/marina-bay-exterior-day.jpg",
        // ... other image fields
      }
    ]
  }
}
```

## CSV Import

You can import image gallery data from a CSV file using the provided script:

```bash
node import-image-gallery-from-csv.js your-csv-file.csv
```

### CSV Format

The CSV file should have the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| project_name | Yes | Project name (must match existing project) |
| image_title | Yes | Title of the image |
| image_url | Yes | URL of the image (must start with http/https) |
| image_description | No | Description of the image |
| image_category | No | Category (exterior, interior, amenities, etc.) |
| display_order | No | Display order (default: 0) |
| is_featured | No | Featured flag (true/false, default: false) |
| alt_text | No | Alt text for accessibility |
| image_size | No | Image size information |
| is_active | No | Active flag (true/false, default: true) |

### CSV Template

A sample CSV template is provided in `image-gallery-template.csv`.

## Setup Instructions

1. **Run the migration:**
   ```bash
   ./run-image-gallery-migration.sh
   ```

2. **Import sample data (optional):**
   ```bash
   node import-sample-image-gallery.js
   ```

3. **Import from CSV:**
   ```bash
   node import-image-gallery-from-csv.js your-csv-file.csv
   ```

## Usage Examples

### Get all images for a specific project
```bash
curl -X GET "http://localhost:1337/api/image-galleries/project/Marina%20Bay%20Residences"
```

### Get featured images
```bash
curl -X GET "http://localhost:1337/api/image-galleries/featured"
```

### Get project with image gallery data
```bash
curl -X GET "http://localhost:1337/api/projects/1"
```

### Create new image gallery entry
```bash
curl -X POST "http://localhost:1337/api/image-galleries" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Marina Bay Residences",
    "image_title": "New Image",
    "image_url": "https://example.com/images/new-image.jpg",
    "image_category": "interior",
    "is_featured": true
  }'
```

## Notes

- Images are linked to projects via the `project_name` field
- The system tries to match both `project.name` and `project.project_name` fields
- Images are ordered by `display_order` and then by `created_at`
- Only active images (`is_active: true`) are returned by default
- The delete operation performs a soft delete by setting `is_active: false`
