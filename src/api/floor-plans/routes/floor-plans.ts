export default {
  routes: [
    {
      method: 'GET',
      path: '/floor-plans',
      handler: 'floor-plans.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/floor-plans/:id',
      handler: 'floor-plans.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/floor-plans',
      handler: 'floor-plans.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/floor-plans/:id',
      handler: 'floor-plans.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/floor-plans/:id',
      handler: 'floor-plans.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom route to get floor plans by project ID
    {
      method: 'GET',
      path: '/floor-plans/project/:projectId',
      handler: 'floor-plans.findByProject',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom route to get floor plans by unit type
    {
      method: 'GET',
      path: '/floor-plans/unit-type/:unitType',
      handler: 'floor-plans.findByUnitType',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom route to get floor plans by project name
    {
      method: 'GET',
      path: '/floor-plans/project-name/:projectName',
      handler: 'floor-plans.findByProjectName',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Test route to verify database connection
    {
      method: 'GET',
      path: '/floor-plans/test',
      handler: 'floor-plans.test',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
}; 