'use strict';

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const handleError = require('../../src/middleware/errorHandler.middleware');
const AppError = require('../../src/utils/AppError');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler.middleware.js', () => {
  const mockReq = {};
  const mockNext = jest.fn();

  it('AppError 인스턴스이면 해당 statusCode와 code/message로 응답한다', () => {
    const err = new AppError(404, 'NOT_FOUND', '리소스를 찾을 수 없습니다.');
    const res = mockRes();

    handleError(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      code: 'NOT_FOUND',
      message: '리소스를 찾을 수 없습니다.',
    });
  });

  it('일반 Error이면 500과 INTERNAL_SERVER_ERROR 코드로 응답한다', () => {
    const err = new Error('예상치 못한 오류');
    const res = mockRes();

    handleError(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
    });
  });

  it('next 인자가 있어도 응답이 올바르게 전송된다', () => {
    const err = new AppError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
    const res = mockRes();

    handleError(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
