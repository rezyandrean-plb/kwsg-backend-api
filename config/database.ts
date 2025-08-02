import path from 'path';

export default ({ env }) => {
  // Check if we should use SQLite for local development
  const useLocalDatabase = env.bool('USE_LOCAL_DATABASE', false);
  
  if (useLocalDatabase) {
    console.log('Using local SQLite database for development');
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..', '..', '.tmp/data.db'),
        },
        useNullAsDefault: true,
      },
    };
  }

  const client = env('DATABASE_CLIENT', 'postgres');

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) ? {
          rejectUnauthorized: false,
          ca: env('DATABASE_SSL_CA', undefined),
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
        } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
        // Add connection timeout settings
        connectionTimeoutMillis: env.int('DATABASE_CONNECTION_TIMEOUT', 30000),
        query_timeout: env.int('DATABASE_QUERY_TIMEOUT', 30000),
        statement_timeout: env.int('DATABASE_STATEMENT_TIMEOUT', 30000),
      },
      pool: { 
        min: env.int('DATABASE_POOL_MIN', 1), 
        max: env.int('DATABASE_POOL_MAX', 3),
        acquireTimeoutMillis: env.int('DATABASE_CONNECTION_TIMEOUT', 30000),
        createTimeoutMillis: env.int('DATABASE_CONNECTION_TIMEOUT', 30000),
        destroyTimeoutMillis: env.int('DATABASE_CONNECTION_TIMEOUT', 30000),
        idleTimeoutMillis: env.int('DATABASE_IDLE_TIMEOUT', 30000),
        reapIntervalMillis: env.int('DATABASE_REAP_INTERVAL', 1000),
        createRetryIntervalMillis: env.int('DATABASE_CREATE_RETRY_INTERVAL', 200),
        // Add pool configuration
        afterCreate: (conn, done) => {
          conn.query('SET statement_timeout = 30000', done);
        },
      },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 30000),
      // Add debug logging for connection issues
      debug: env.bool('DATABASE_DEBUG', false),
    },
  };
};
