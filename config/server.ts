export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  proxy: env.bool('IS_PROXIED', false),
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
  admin: {
    autoOpen: false,
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    watchIgnoreFiles: [
      '**/config/sync/**',
    ],
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
