'use strict';

const logger = require('../utils/logger');
const httpStatus = require('../constants/httpStatus');

// eslint-disable-next-line no-unused-vars
function handleError(err, req, res, next) {
  logger.error(err.message, { stack: err.stack });

  if (err.isAppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    });
  }

  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다.',
  });
}

module.exports = handleError;
