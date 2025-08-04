# Projects API - Image URL Banner Field Update

## Overview
Added a new `image_url_banner` field to the projects API to support banner images for projects.

## Changes Made

### 1. Database Schema Update
- **Migration File**: `database/migrations/006_add_image_url_banner_to_projects.js`
- **Action**: Added `image_url_banner` column to the `projects` table
- **Type**: VARCHAR (nullable)
- **Default Value**: NULL for all existing records

### 2. Strapi Schema Update
- **File**: `src/api/projects/content-types/project/schema.json`
- **Action**: Added `image_url_banner` field definition
- **Type**: string (optional)

### 3. API Response
The `/api/projects` GET endpoint now includes the `image_url_banner` field in the response:

```json
{
  "id": 221,
  "name": "Kediri Residence City Center",
  "location": "Kediri, East Java",
  "image_url_banner": null,
  // ... other fields
}
```

## Migration Execution

### Running the Migration
```bash
./run-projects-banner-migration.sh
```

### Verification
```bash
node test-projects-banner-api.js
```

## Current Status
- ✅ Database column added successfully
- ✅ Schema updated
- ✅ API returning the new field
- ✅ All existing projects have `image_url_banner: null`
- ✅ Ready for banner image URLs to be populated

## Usage
The `image_url_banner` field can now be:
- **Read**: Retrieved via GET `/api/projects`
- **Updated**: Modified via PUT/PATCH `/api/projects/:id`
- **Created**: Set when creating new projects via POST `/api/projects`

## Example Usage
```bash
# Get all projects with banner field
curl http://localhost:1337/api/projects

# Update a project's banner image
curl -X PUT http://localhost:1337/api/projects/221 \
  -H "Content-Type: application/json" \
  -d '{"image_url_banner": "https://example.com/banner.jpg"}'
```

## Files Created/Modified
- `database/migrations/006_add_image_url_banner_to_projects.js` (NEW)
- `src/api/projects/content-types/project/schema.json` (MODIFIED)
- `run-projects-banner-migration.sh` (NEW)
- `test-projects-banner-api.js` (NEW)
- `PROJECTS_BANNER_UPDATE.md` (NEW) 