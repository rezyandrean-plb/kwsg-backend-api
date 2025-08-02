export default {
  routes: [
    {
      method: 'GET',
      path: '/projects',
      handler: 'projects.find',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Retrieve all projects',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'find',
        },
        responses: {
          200: {
            description: 'List of projects retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Project',
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/projects/:id',
      handler: 'projects.findOne',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
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
            schema: {
              type: 'integer',
            },
            description: 'Project ID',
          },
        ],
        responses: {
          200: {
            description: 'Project retrieved successfully with all related data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Project',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Project not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/projects',
      handler: 'projects.create',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Create a new project',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'create',
        },
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Project created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Project',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    {
      method: 'PUT',
      path: '/projects/:id',
      handler: 'projects.update',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Update an existing project',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'update',
        },
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'Project ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Project updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Project',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: '/projects/:id',
      handler: 'projects.delete',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Delete a project',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'delete',
        },
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'Project ID',
          },
        ],
        responses: {
          200: {
            description: 'Project deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        deleted: {
                          type: 'boolean',
                          description: 'Whether the project was deleted',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    // Custom route to get projects by location
    {
      method: 'GET',
      path: '/projects/location/:location',
      handler: 'projects.findByLocation',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Retrieve projects filtered by location',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'findByLocation',
        },
        parameters: [
          {
            name: 'location',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Location to filter projects by',
          },
        ],
        responses: {
          200: {
            description: 'Projects filtered by location retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Project',
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    
    // Custom route to get projects with filters
    {
      method: 'GET',
      path: '/projects/search',
      handler: 'projects.find',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Search projects with filters',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'search',
        },
        responses: {
          200: {
            description: 'Projects search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Project',
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    
    // Test route to verify database connection
    {
      method: 'GET',
      path: '/projects/test',
      handler: 'projects.test',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Test database connection and projects table',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'test',
        },
        responses: {
          200: {
            description: 'Database connection test result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: 'Test result message',
                    },
                    projectsCount: {
                      type: 'integer',
                      description: 'Number of projects in database',
                    },
                    testResult: {
                      type: 'object',
                      description: 'Database test result',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // Simple test route without database
    {
      method: 'GET',
      path: '/projects/simple-test',
      handler: 'projects.simpleTest',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Simple API test without database',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'simpleTest',
        },
        responses: {
          200: {
            description: 'Simple test successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: 'Test result message',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Test timestamp',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // Ultra simple test route - no database, no complex logic
    {
      method: 'GET',
      path: '/projects/ultra-simple-test',
      handler: 'projects.ultraSimpleTest',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Ultra simple API test - no database access',
        tag: {
          plugin: 'api::projects.projects',
          name: 'Projects',
          actionType: 'ultraSimpleTest',
        },
        responses: {
          200: {
            description: 'Ultra simple test successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: 'Test result message',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Test timestamp',
                    },
                    status: {
                      type: 'string',
                      description: 'Test status',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ],
};
