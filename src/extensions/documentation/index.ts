export default () => ({
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/documentation',
      handler: 'documentation.index',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
  controllers: {
    documentation: {
      index: async (ctx) => {
        // Custom OpenAPI specification that includes our endpoints
        const openApiSpec = {
          openapi: '3.0.0',
          info: {
            version: '1.0.0',
            title: 'KWSG Strapi API Documentation',
            description: 'API documentation for KWSG Strapi application',
          },
          servers: [
            {
              url: 'http://localhost:1337',
              description: 'Development server',
            },
          ],
          components: {
            schemas: {
              Project: {
                type: 'object',
                properties: {
                  id: { type: 'integer', description: 'Unique project identifier' },
                  name: { type: 'string', description: 'Project name' },
                  location: { type: 'string', description: 'Project location' },
                  developer: { type: 'string', description: 'Developer name' },
                  price: { type: 'string', description: 'Project price range' },
                  completion: { type: 'string', description: 'Project completion date' },
                  description: { type: 'string', description: 'Project description' },
                  status: { type: 'string', description: 'Project status' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                },
                required: ['name', 'location'],
              },
              PressArticle: {
                type: 'object',
                properties: {
                  id: { type: 'integer', description: 'Unique press article identifier' },
                  title: { type: 'string', description: 'Article title' },
                  slug: { type: 'string', description: 'Article slug for URL' },
                  content: { type: 'string', description: 'Article content' },
                  excerpt: { type: 'string', description: 'Article excerpt/summary' },
                  source: { type: 'string', description: 'Source of the article' },
                  source_url: { type: 'string', description: 'URL to the original article' },
                  published_date: { type: 'string', format: 'date', description: 'Publication date' },
                  author: { type: 'string', description: 'Article author' },
                  image_url: { type: 'string', description: 'Featured image URL' },
                  tags: { type: 'array', items: { type: 'string' }, description: 'Article tags' },
                  is_featured: { type: 'boolean', description: 'Whether article is featured' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                },
                required: ['title', 'content'],
              },
              Error: {
                type: 'object',
                properties: {
                  error: { type: 'string', description: 'Error message' },
                  statusCode: { type: 'integer', description: 'HTTP status code' },
                },
              },
            },
          },
          tags: [
            {
              name: 'Projects',
              description: 'Real estate project management endpoints',
            },
            {
              name: 'Press Articles',
              description: 'Press article management endpoints',
            },
          ],
          paths: {
            '/api/projects': {
              get: {
                tags: ['Projects'],
                summary: 'Get all projects',
                description: 'Retrieve all projects from the database',
                responses: {
                  '200': {
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
                  '500': {
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
            '/api/projects/{id}': {
              get: {
                tags: ['Projects'],
                summary: 'Get project by ID',
                description: 'Retrieve a specific project by ID',
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
                  '200': {
                    description: 'Project retrieved successfully',
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
                  '404': {
                    description: 'Project not found',
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
            '/api/press-articles': {
              get: {
                tags: ['Press Articles'],
                summary: 'Get all press articles',
                description: 'Retrieve all press articles from the database',
                responses: {
                  '200': {
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
                  '500': {
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
            '/api/press-articles/{id}': {
              get: {
                tags: ['Press Articles'],
                summary: 'Get press article by ID',
                description: 'Retrieve a specific press article by ID',
                parameters: [
                  {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'integer',
                    },
                    description: 'Press Article ID',
                  },
                ],
                responses: {
                  '200': {
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
                  '404': {
                    description: 'Press article not found',
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
          },
        };

        ctx.body = openApiSpec;
      },
    },
  },
}); 