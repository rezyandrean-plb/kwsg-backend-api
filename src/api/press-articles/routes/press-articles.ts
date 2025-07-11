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
      },
    },
  ],
}; 