'use strict';

const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const httpStatus = require('../constants/httpStatus');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.error('만료된 토큰 접근 시도', { name: err.name });
      return res.status(httpStatus.UNAUTHORIZED).json({
        code: 'UNAUTHORIZED',
        message: '만료된 토큰입니다.',
      });
    }

    logger.error('유효하지 않은 토큰 접근 시도', { name: err.name });
    return res.status(httpStatus.UNAUTHORIZED).json({
      code: 'UNAUTHORIZED',
      message: '유효하지 않은 토큰입니다.',
    });
  }
}

module.exports = authMiddleware;
