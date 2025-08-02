# Swagger/OpenAPI Documentation Setup

This document explains how to use the Swagger/OpenAPI documentation that has been implemented for the KWSG Strapi API.

## Overview

The API documentation is powered by the `@strapi/plugin-documentation` plugin, which automatically generates OpenAPI 3.0 specification documentation for all your API endpoints.

## Accessing the Documentation

### Development Environment
Once your Strapi server is running, you can access the documentation at:

```
http://localhost:1337/documentation
```

### Production Environment
In production, the documentation will be available at:

```
https://your-production-domain.com/documentation
```

## Features

### 1. Interactive API Testing
- **Try it out**: Test API endpoints directly from the documentation interface
- **Request/Response examples**: See example requests and responses for each endpoint
- **Authentication**: Test authenticated endpoints with JWT tokens

### 2. Comprehensive Documentation
- **Endpoint descriptions**: Detailed descriptions for each API endpoint
- **Request/Response schemas**: Complete schema definitions for all data models
- **Error responses**: Documented error codes and messages
- **Parameters**: Path, query, and body parameters with validation rules

### 3. API Organization
The documentation is organized into logical groups:

- **Projects**: Real estate project management endpoints
- **Developers**: Developer information endpoints
- **Facilities**: Project facilities endpoints
- **Floor Plans**: Floor plan management endpoints
- **Press Articles**: Press article management endpoints
- **Brochures**: Brochure management endpoints
- **Authentication**: Authentication and authorization endpoints

## Configuration

### Plugin Configuration
The documentation plugin is configured in `config/plugins.ts`:

```typescript
export default () => ({
  documentation: {
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'KWSG Strapi API Documentation',
        description: 'Comprehensive API documentation for KWSG Strapi application...',
        contact: {
          name: 'API Support',
          email: 'support@kwsg.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:1337',
          description: 'Development server',
        },
        {
          url: 'https://your-production-domain.com',
          description: 'Production server',
        },
      ],
      security: [
        {
          bearerAuth: [],
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token for authentication',
          },
        },
        schemas: {
          // Data model schemas
        },
      },
      tags: [
        // API endpoint groupings
      ],
    },
  },
});
```

### Route Documentation
Each route can be documented with OpenAPI annotations in the route configuration:

```typescript
{
  method: 'GET',
  path: '/projects/:id',
  handler: 'projects.findOne',
  config: {
    description: 'Retrieve a specific project by ID with all related data',
    tag: {
      plugin: 'api::projects.projects',
      name: 'Projects',
      actionType: 'findOne',
    },
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'Project ID',
      },
    ],
    responses: {
      200: {
        description: 'Project retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: { $ref: '#/components/schemas/Project' },
              },
            },
          },
        },
      },
      404: {
        description: 'Project not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
}
```

## Using the Documentation

### 1. Authentication
For endpoints that require authentication:

1. Click the "Authorize" button at the top of the documentation
2. Enter your JWT token in the format: `Bearer your-jwt-token`
3. Click "Authorize" to apply the token to all requests

### 2. Testing Endpoints
1. Navigate to the endpoint you want to test
2. Click "Try it out"
3. Fill in any required parameters
4. Click "Execute" to make the request
5. View the response in the documentation interface

### 3. Understanding Responses
- **200**: Successful response
- **400**: Bad request (validation errors)
- **401**: Unauthorized (authentication required)
- **404**: Resource not found
- **500**: Internal server error

## Available Endpoints

### Projects API
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID with related data
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/location/:location` - Get projects by location
- `GET /api/projects/search` - Search projects with filters
- `GET /api/projects/test` - Test database connection
- `GET /api/projects/simple-test` - Simple API test

### Other APIs
- **Developers**: `/api/developers`
- **Facilities**: `/api/facilities`
- **Floor Plans**: `/api/floor-plans`
- **Press Articles**: `/api/press-articles`
- **Brochures**: `/api/brochures`

## Data Models

### Project Schema
```json
{
  "id": "integer",
  "name": "string",
  "location": "string",
  "developer": "string",
  "price": "string",
  "completion": "string",
  "description": "string",
  "status": "string",
  "created_at": "date-time",
  "updated_at": "date-time"
}
```

### Error Schema
```json
{
  "error": "string",
  "statusCode": "integer"
}
```

## Customization

### Adding New Endpoints
1. Create your controller method
2. Add the route to your routes file
3. Add OpenAPI documentation annotations to the route config
4. Restart your Strapi server

### Modifying Schemas
1. Update the schema definitions in `config/plugins.ts`
2. Update route documentation to reference the new schemas
3. Restart your Strapi server

### Adding Authentication
1. Update the security schemes in the plugin configuration
2. Add authentication requirements to specific routes
3. Test with valid JWT tokens

## Troubleshooting

### Documentation Not Loading
1. Ensure the `@strapi/plugin-documentation` package is installed
2. Check that the plugin is properly configured in `config/plugins.ts`
3. Restart your Strapi server
4. Clear browser cache

### Missing Endpoints
1. Verify that routes are properly configured
2. Check that controllers exist and are properly exported
3. Ensure route documentation annotations are correct
4. Restart your Strapi server

### Authentication Issues
1. Verify JWT token format: `Bearer your-token`
2. Check that the token is valid and not expired
3. Ensure the endpoint requires authentication
4. Test with a fresh token

## Best Practices

1. **Keep Documentation Updated**: Update route documentation when adding new endpoints
2. **Use Descriptive Names**: Use clear, descriptive names for endpoints and parameters
3. **Provide Examples**: Include example requests and responses where helpful
4. **Document Errors**: Always document possible error responses
5. **Group Related Endpoints**: Use tags to organize related endpoints
6. **Test Regularly**: Use the documentation interface to test your API regularly

## Exporting Documentation

You can export the OpenAPI specification as JSON or YAML for use with other tools:

- **JSON**: `http://localhost:1337/documentation/v1.0.0/openapi.json`
- **YAML**: `http://localhost:1337/documentation/v1.0.0/openapi.yaml`

This exported specification can be used with:
- Postman collections
- Code generation tools
- API testing frameworks
- Documentation generators

## Support

For issues with the documentation setup:
1. Check the Strapi documentation plugin documentation
2. Review the OpenAPI 3.0 specification
3. Check the browser console for errors
4. Verify your Strapi version compatibility 