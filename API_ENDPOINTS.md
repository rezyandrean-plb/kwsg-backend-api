# API Endpoints Documentation

This document outlines all available API endpoints for the property management system.

## Base URL
All endpoints are prefixed with `/api`

## 1. Projects API

### GET /api/projects
Get all projects
- **Response**: Array of project objects
- **Query Parameters**: 
  - `limit` (optional): Number of results to return
  - `start` (optional): Starting index for pagination

### GET /api/projects/:id
Get a single project by ID
- **Response**: Single project object with detailed information

### POST /api/projects
Create a new project
- **Request Body**:
```json
{
  "name": "string (required)",
  "project_name": "string (required)",
  "title": "string (required)",
  "location": "string (required)",
  "address": "text (required)",
  "type": "string (required)",
  "price": "string (required)",
  "price_from": "string (optional)",
  "price_per_sqft": "string (optional)",
  "bedrooms": "string (required)",
  "bathrooms": "string (required)",
  "size": "string (required)",
  "units": "string (required)",
  "developer": "string (required)",
  "completion": "string (required)",
  "description": "text (required)",
  "features": "json (optional)",
  "district": "string (required)",
  "tenure": "string (required)",
  "property_type": "string (required)",
  "status": "string (required)",
  "total_units": "string (required)",
  "total_floors": "string (required)",
  "site_area": "string (required)",
  "latitude": "decimal (required)",
  "longitude": "decimal (required)"
}
```

### PUT /api/projects/:id
Update an existing project
- **Request Body**: Same as POST, but all fields are optional

### DELETE /api/projects/:id
Delete a project
- **Response**: `{ "deleted": true/false }`

### GET /api/projects/location/:location
Get projects by location
- **Response**: Array of projects matching the location

### GET /api/projects/search
Search projects with filters
- **Query Parameters**: Various filter options

---

## 2. Project Images API

### GET /api/project-images
Get all project images
- **Response**: Array of project image objects

### GET /api/project-images/:id
Get a single project image by ID
- **Response**: Single project image object

### POST /api/project-images
Create a new project image
- **Request Body**:
```json
{
  "project_id": "integer (required)",
  "image_url": "string (required)",
  "alt_text": "string (optional)",
  "display_order": "integer (optional, default: 0)",
  "is_primary": "boolean (optional, default: false)",
  "caption": "text (optional)"
}
```

### PUT /api/project-images/:id
Update a project image
- **Request Body**: Same as POST, but all fields are optional

### DELETE /api/project-images/:id
Delete a project image
- **Response**: `{ "deleted": true/false }`

### GET /api/project-images/project/:projectId
Get all images for a specific project
- **Response**: Array of project images

---

## 3. Facilities API

### GET /api/facilities
Get all active facilities
- **Response**: Array of facility objects

### GET /api/facilities/:id
Get a single facility by ID
- **Response**: Single facility object

### POST /api/facilities
Create a new facility
- **Request Body**:
```json
{
  "name": "string (required)",
  "description": "text (optional)",
  "icon": "string (optional)",
  "category": "string (optional)",
  "is_active": "boolean (optional, default: true)"
}
```

### PUT /api/facilities/:id
Update a facility
- **Request Body**: Same as POST, but all fields are optional

### DELETE /api/facilities/:id
Delete a facility
- **Response**: `{ "deleted": true/false }`

### GET /api/facilities/category/:category
Get facilities by category
- **Response**: Array of facilities in the specified category

---

## 4. Developers API

### GET /api/developers
Get all active developers
- **Response**: Array of developer objects

### GET /api/developers/:id
Get a single developer by ID
- **Response**: Single developer object

### POST /api/developers
Create a new developer
- **Request Body**:
```json
{
  "name": "string (required)",
  "description": "text (optional)",
  "logo_url": "string (optional)",
  "website": "string (optional)",
  "contact_email": "email (optional)",
  "contact_phone": "string (optional)",
  "address": "text (optional)",
  "established_year": "integer (optional)",
  "is_active": "boolean (optional, default: true)"
}
```

### PUT /api/developers/:id
Update a developer
- **Request Body**: Same as POST, but all fields are optional

### DELETE /api/developers/:id
Delete a developer
- **Response**: `{ "deleted": true/false }`

### GET /api/developers/name/:name
Get developer by name (partial match)
- **Response**: Single developer object

---

## 5. Floor Plans API

### GET /api/floor-plans
Get all floor plans
- **Response**: Array of floor plan objects

### GET /api/floor-plans/:id
Get a single floor plan by ID
- **Response**: Single floor plan object

### POST /api/floor-plans
Create a new floor plan
- **Request Body**:
```json
{
  "project_id": "integer (required)",
  "unit_type": "string (required)",
  "bedrooms": "string (required)",
  "bathrooms": "string (required)",
  "size_sqft": "decimal (required)",
  "price": "string (required)",
  "floor_plan_image": "string (required)",
  "description": "text (optional)",
  "is_available": "boolean (optional, default: true)"
}
```

### PUT /api/floor-plans/:id
Update a floor plan
- **Request Body**: Same as POST, but all fields are optional

### DELETE /api/floor-plans/:id
Delete a floor plan
- **Response**: `{ "deleted": true/false }`

### GET /api/floor-plans/project/:projectId
Get floor plans for a specific project
- **Response**: Array of available floor plans

### GET /api/floor-plans/unit-type/:unitType
Get floor plans by unit type
- **Response**: Array of floor plans for the specified unit type

---

## Response Format

All successful responses follow this format:
```json
{
  "data": {
    // Response data here
  }
}
```

Error responses follow this format:
```json
{
  "error": {
    "status": 400,
    "name": "BadRequest",
    "message": "Error message here"
  }
}
```

## Authentication

Currently, all endpoints are public. For production use, consider implementing authentication middleware.

## Rate Limiting

Consider implementing rate limiting for production use to prevent abuse.

## CORS

Make sure to configure CORS properly for cross-origin requests if needed. 