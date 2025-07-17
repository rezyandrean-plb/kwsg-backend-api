export default {
  routes: [
    {
      method: 'GET',
      path: '/projects',
      handler: 'projects.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/projects/:id',
      handler: 'projects.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/projects',
      handler: 'projects.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/projects/:id',
      handler: 'projects.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/projects/:id',
      handler: 'projects.delete',
      config: {
        policies: [],
        middlewares: [],
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
      },
    },
  ],
};
