'use strict';

const env = require('./config/env');
const db = require('./config/database');
const app = require('./app');
const logger = require('./utils/logger');

async function startServer() {
  await db.connect();
  const server = app.listen(env.port, () => {
    logger.info(`TodoList API server running on port ${env.port}`);
  });
  return server;
}

startServer();
