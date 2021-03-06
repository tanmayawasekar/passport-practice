// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host: process.env.MY_SQL_HOST || '127.0.0.1',
      insecureAuth: true,
      database: 'passport-practice',
      user:     'root',
      password: '7825tanmay'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host: process.env.MY_SQL_HOST || '127.0.0.1',
      database: 'passport-practice',
      user:     'root',
      password: '7825tanmay'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: process.env.MY_SQL_HOST || '127.0.0.1',
      database: 'passport-practice',
      user:     'root',
      password: '7825tanmay'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
