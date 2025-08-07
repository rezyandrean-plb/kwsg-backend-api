/**
 * site-plans router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/site-plans',
      handler: 'site-plans.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/site-plans/:id',
      handler: 'site-plans.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/site-plans',
      handler: 'site-plans.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/site-plans/:id',
      handler: 'site-plans.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/site-plans/:id',
      handler: 'site-plans.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
