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
      },
    },
  ],
}; 