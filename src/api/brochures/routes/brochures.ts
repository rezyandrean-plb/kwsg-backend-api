export default {
  routes: [
    {
      method: 'GET',
      path: '/brochures',
      handler: 'brochures.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/brochures/:id',
      handler: 'brochures.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/brochures/project/:projectName',
      handler: 'brochures.findByProject',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/brochures',
      handler: 'brochures.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/brochures/:id',
      handler: 'brochures.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/brochures/:id',
      handler: 'brochures.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Test route to verify database connection
    {
      method: 'GET',
      path: '/brochures/test',
      handler: 'brochures.test',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
}; 