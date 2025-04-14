const mysql = require('mysql2/promise');
require('dotenv').config();

const createPool = () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on pool', err);
  });

  return pool;
};

const pool = createPool();

module.exports = {
  query: async (text, params) => {
    try {
      const [rows] = await pool.execute(text, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};