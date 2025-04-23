const pg = require('pg');
require('dotenv').config();

const createClient = () => {
  const client = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DB_SSL_CA,
    },
  });

  client.connect((err) => {
    if (err) {
      console.error('Database connection error:', err);
      throw err;
    }
  });

  return client;
};

module.exports = {
  query: async (text, params) => {
    const client = createClient();
    try {
      const res = await client.query(text, params);
      return res.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.end();
    }
  }
};