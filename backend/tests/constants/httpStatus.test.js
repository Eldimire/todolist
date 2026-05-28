'use strict';

const httpStatus = require('../../src/constants/httpStatus');

describe('src/constants/httpStatus.js', () => {
  const REQUIRED_KEYS = [
    'OK',
    'CREATED',
    'BAD_REQUEST',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'UNPROCESSABLE_ENTITY',
    'INTERNAL_SERVER_ERROR',
  ];

  it('필수 상태코드 9개가 모두 정의되어 있다', () => {
    for (const key of REQUIRED_KEYS) {
      expect(httpStatus).toHaveProperty(key);
    }
    expect(REQUIRED_KEYS.length).toBe(9);
  });

  it('각 상태코드 값이 올바른 숫자이다', () => {
    expect(httpStatus.OK).toBe(200);
    expect(httpStatus.CREATED).toBe(201);
    expect(httpStatus.BAD_REQUEST).toBe(400);
    expect(httpStatus.UNAUTHORIZED).toBe(401);
    expect(httpStatus.FORBIDDEN).toBe(403);
    expect(httpStatus.NOT_FOUND).toBe(404);
    expect(httpStatus.CONFLICT).toBe(409);
    expect(httpStatus.UNPROCESSABLE_ENTITY).toBe(422);
    expect(httpStatus.INTERNAL_SERVER_ERROR).toBe(500);
  });
});
