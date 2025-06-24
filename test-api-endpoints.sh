#!/bin/bash

# Test script for API endpoints
# Make sure your Strapi server is running on http://localhost:1337

BASE_URL="http://localhost:1337/api"

echo "Testing API Endpoints..."
echo "========================"

# Test Projects API
echo "1. Testing Projects API"
echo "-----------------------"

# Create a test project
echo "Creating a test project..."
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "project_name": "Test Property Development",
    "title": "Luxury Condominium",
    "location": "Downtown",
    "address": "123 Test Street, Downtown",
    "type": "Condo",
    "price": "500000",
    "bedrooms": "2",
    "bathrooms": "2",
    "size": "1200 sqft",
    "units": "100",
    "developer": "Test Developer",
    "completion": "2024-12-31",
    "description": "A luxury condominium development",
    "district": "Downtown",
    "tenure": "Freehold",
    "property_type": "Residential",
    "status": "Under Construction",
    "total_units": "100",
    "total_floors": "20",
    "site_area": "50000 sqft",
    "latitude": 1.3521,
    "longitude": 103.8198
  }')

echo "Project creation response: $PROJECT_RESPONSE"

# Get all projects
echo "Getting all projects..."
curl -s -X GET "$BASE_URL/projects" | jq '.'

echo ""
echo "2. Testing Project Images API"
echo "-----------------------------"

# Create a test project image
echo "Creating a test project image..."
IMAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/project-images" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "image_url": "https://example.com/test-image.jpg",
    "alt_text": "Test Project Image",
    "display_order": 1,
    "is_primary": true,
    "caption": "Exterior view of the building"
  }')

echo "Project image creation response: $IMAGE_RESPONSE"

# Get all project images
echo "Getting all project images..."
curl -s -X GET "$BASE_URL/project-images" | jq '.'

echo ""
echo "3. Testing Facilities API"
echo "-------------------------"

# Create a test facility
echo "Creating a test facility..."
FACILITY_RESPONSE=$(curl -s -X POST "$BASE_URL/facilities" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Swimming Pool",
    "description": "Olympic size swimming pool",
    "icon": "pool-icon",
    "category": "Recreation",
    "is_active": true
  }')

echo "Facility creation response: $FACILITY_RESPONSE"

# Get all facilities
echo "Getting all facilities..."
curl -s -X GET "$BASE_URL/facilities" | jq '.'

echo ""
echo "4. Testing Developers API"
echo "-------------------------"

# Create a test developer
echo "Creating a test developer..."
DEVELOPER_RESPONSE=$(curl -s -X POST "$BASE_URL/developers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Developer Ltd",
    "description": "A leading property developer",
    "logo_url": "https://example.com/logo.png",
    "website": "https://testdeveloper.com",
    "contact_email": "info@testdeveloper.com",
    "contact_phone": "+65 1234 5678",
    "address": "456 Developer Street, Singapore",
    "established_year": 2010,
    "is_active": true
  }')

echo "Developer creation response: $DEVELOPER_RESPONSE"

# Get all developers
echo "Getting all developers..."
curl -s -X GET "$BASE_URL/developers" | jq '.'

echo ""
echo "5. Testing Floor Plans API"
echo "--------------------------"

# Create a test floor plan
echo "Creating a test floor plan..."
FLOORPLAN_RESPONSE=$(curl -s -X POST "$BASE_URL/floor-plans" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "unit_type": "2 Bedroom",
    "bedrooms": "2",
    "bathrooms": "2",
    "size_sqft": 1200.00,
    "price": "500000",
    "floor_plan_image": "https://example.com/floorplan.jpg",
    "description": "Spacious 2 bedroom unit with city view",
    "is_available": true
  }')

echo "Floor plan creation response: $FLOORPLAN_RESPONSE"

# Get all floor plans
echo "Getting all floor plans..."
curl -s -X GET "$BASE_URL/floor-plans" | jq '.'

echo ""
echo "API Testing Complete!"
echo "====================="
echo "Check the responses above to verify all endpoints are working correctly."
echo ""
echo "Note: Make sure you have 'jq' installed for JSON formatting."
echo "If you don't have jq, you can install it with: brew install jq (macOS) or apt-get install jq (Ubuntu)" 