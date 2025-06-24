#!/bin/bash

echo "Testing Projects API endpoints..."
echo "=================================="

# Base URL
BASE_URL="http://localhost:1337/api"

echo "1. Get all projects:"
curl -X GET "$BASE_URL/projects" | jq '.'

echo -e "\n2. Get projects with pagination:"
curl -X GET "$BASE_URL/projects?pagination[page]=1&pagination[pageSize]=5" | jq '.'

echo -e "\n3. Get projects with specific fields:"
curl -X GET "$BASE_URL/projects?fields=name,title,location,status" | jq '.'

echo -e "\n4. Get projects filtered by status (if any exist):"
curl -X GET "$BASE_URL/projects?filters[status][\$eq]=active" | jq '.'

echo -e "\n5. Get projects sorted by name:"
curl -X GET "$BASE_URL/projects?sort=name:asc" | jq '.'

echo -e "\nAPI testing completed!" 