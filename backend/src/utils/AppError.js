'use strict';

class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isAppError = true;
  }
}

module.exports = AppError;
