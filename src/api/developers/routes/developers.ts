export default {
  routes: [
    {
      method: 'GET',
      path: '/developers',
      handler: 'developers.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/developers/:id',
      handler: 'developers.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/developers',
      handler: 'developers.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/developers/:id',
      handler: 'developers.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/developers/:id',
      handler: 'developers.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom route to get developer by name
    {
      method: 'GET',
      path: '/developers/name/:name',
      handler: 'developers.findByName',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 