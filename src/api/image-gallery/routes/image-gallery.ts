export default {
  routes: [
    {
      method: 'GET',
      path: '/image-galleries',
      handler: 'image-gallery.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/image-galleries/featured',
      handler: 'image-gallery.getFeatured',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/image-galleries/project/:projectName',
      handler: 'image-gallery.findByProject',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/image-galleries/category/:category',
      handler: 'image-gallery.getByCategory',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/image-galleries/:id',
      handler: 'image-gallery.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/image-galleries',
      handler: 'image-gallery.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/image-galleries/:id',
      handler: 'image-gallery.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/image-galleries/:id',
      handler: 'image-gallery.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
