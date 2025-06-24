export default {
  routes: [
    {
      method: 'GET',
      path: '/project-images',
      handler: 'project-images.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/project-images/:id',
      handler: 'project-images.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/project-images',
      handler: 'project-images.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/project-images/:id',
      handler: 'project-images.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/project-images/:id',
      handler: 'project-images.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom route to get images by project ID
    {
      method: 'GET',
      path: '/project-images/project/:projectId',
      handler: 'project-images.findByProject',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 