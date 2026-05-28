'use strict';

const AppError = require('../../src/utils/AppError');

describe('AppError', () => {
  it('생성 시 statusCode, code, message, isAppError 속성이 올바르게 설정된다', () => {
    const err = new AppError(404, 'NOT_FOUND', '리소스를 찾을 수 없습니다.');

    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('리소스를 찾을 수 없습니다.');
    expect(err.isAppError).toBe(true);
  });

  it('Error를 상속한다 (instanceof Error)', () => {
    const err = new AppError(400, 'VALIDATION_ERROR', '유효성 검사 실패');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});
