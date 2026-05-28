'use strict';

const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  max: 20,
});

/**
 * @param {string} text
 * @param {Array} [params]
 */
function query(text, params) {
  return pool.query(text, params);
}

async function connect() {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connection established successfully');
  } catch (err) {
    logger.error('Failed to connect to database:', err.message);
  }
}

module.exports = { pool, query, connect };
