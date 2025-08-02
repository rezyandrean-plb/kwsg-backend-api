export default {
  routes: [
    // Get all press articles
    {
      method: 'GET',
      path: '/press-articles',
      handler: 'press-articles.find',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Retrieve all press articles',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
          actionType: 'find',
        },
        responses: {
          200: {
            description: 'List of press articles retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/PressArticle',
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
    // Search press articles
    {
      method: 'GET',
      path: '/press-articles/search',
      handler: 'press-articles.search',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Search press articles with filters',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
          actionType: 'search',
        },
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
            },
            description: 'Search query',
          },
          {
            name: 'year',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
            },
            description: 'Filter by year',
          },
          {
            name: 'source',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
            },
            description: 'Filter by source',
          },
        ],
        responses: {
          200: {
            description: 'Press articles search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/PressArticle',
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
    // Get a single press article by ID
    {
      method: 'GET',
      path: '/press-articles/:id',
      handler: 'press-articles.findOne',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Retrieve a specific press article by ID',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
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
            description: 'Press article ID',
          },
        ],
        responses: {
          200: {
            description: 'Press article retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/PressArticle',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Press article not found',
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
    // Get press article by slug
    {
      method: 'GET',
      path: '/press-articles/slug/:slug',
      handler: 'press-articles.findBySlug',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Retrieve a press article by its slug',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
          actionType: 'findBySlug',
        },
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Press article slug',
          },
        ],
        responses: {
          200: {
            description: 'Press article retrieved successfully by slug',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/PressArticle',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Press article not found',
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
    // Get press articles by year
    {
      method: 'GET',
      path: '/press-articles/year/:year',
      handler: 'press-articles.findByYear',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Retrieve press articles filtered by year',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
          actionType: 'findByYear',
        },
        parameters: [
          {
            name: 'year',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'Year to filter press articles by',
          },
        ],
        responses: {
          200: {
            description: 'Press articles filtered by year retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/PressArticle',
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
    // Get press articles by source
    {
      method: 'GET',
      path: '/press-articles/source/:source',
      handler: 'press-articles.findBySource',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Retrieve press articles filtered by source',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
          actionType: 'findBySource',
        },
        parameters: [
          {
            name: 'source',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Source to filter press articles by',
          },
        ],
        responses: {
          200: {
            description: 'Press articles filtered by source retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/PressArticle',
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
    // Create a new press article
    {
      method: 'POST',
      path: '/press-articles',
      handler: 'press-articles.create',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Create a new press article',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
          actionType: 'create',
        },
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PressArticle',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Press article created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/PressArticle',
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
    // Update a press article
    {
      method: 'PUT',
      path: '/press-articles/:id',
      handler: 'press-articles.update',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Update an existing press article',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
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
            description: 'Press article ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PressArticle',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Press article updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/PressArticle',
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
          404: {
            description: 'Press article not found',
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
    // Delete a press article
    {
      method: 'DELETE',
      path: '/press-articles/:id',
      handler: 'press-articles.delete',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Delete a press article',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
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
            description: 'Press article ID',
          },
        ],
        responses: {
          200: {
            description: 'Press article deleted successfully',
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
                          description: 'Whether the press article was deleted',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Press article not found',
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
    // Bulk create press articles (for seeding data)
    {
      method: 'POST',
      path: '/press-articles/bulk',
      handler: 'press-articles.bulkCreate',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Bulk create multiple press articles',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
          actionType: 'bulkCreate',
        },
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  articles: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/PressArticle',
                    },
                    description: 'Array of press articles to create',
                  },
                },
                required: ['articles'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Press articles bulk created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/PressArticle',
                      },
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of articles created',
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
    // Test endpoint to check database connection
    {
      method: 'GET',
      path: '/press-articles/test-db',
      handler: 'press-articles.testDb',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Test database connection for press articles',
        tag: {
          plugin: 'api::press-articles.press-articles',
          name: 'Press Articles',
          actionType: 'testDb',
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
                    articlesCount: {
                      type: 'integer',
                      description: 'Number of press articles in database',
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
  ],
}; 