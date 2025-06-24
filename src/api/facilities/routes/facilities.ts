export default {
  routes: [
    {
      method: 'GET',
      path: '/facilities',
      handler: 'facilities.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/facilities/:id',
      handler: 'facilities.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/facilities',
      handler: 'facilities.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/facilities/:id',
      handler: 'facilities.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/facilities/:id',
      handler: 'facilities.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom route to get facilities by category
    {
      method: 'GET',
      path: '/facilities/category/:category',
      handler: 'facilities.findByCategory',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 