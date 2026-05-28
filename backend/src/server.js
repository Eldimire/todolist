'use strict';

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TodoList API server is running on port ${PORT}`);
});

module.exports = server;
