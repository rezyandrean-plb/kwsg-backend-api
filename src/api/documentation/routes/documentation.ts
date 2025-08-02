export default {
  routes: [
    {
      method: 'GET',
      path: '/documentation',
      handler: 'documentation.index',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
}; 