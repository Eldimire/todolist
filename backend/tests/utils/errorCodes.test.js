'use strict';

const errorCodes = require('../../src/utils/errorCodes');

const REQUIRED_CODES = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'EMAIL_ALREADY_EXISTS',
  'INVALID_CREDENTIALS',
  'CATEGORY_NOT_FOUND',
  'DEFAULT_CATEGORY_NOT_MODIFIABLE',
  'DEFAULT_CATEGORY_NOT_DELETABLE',
  'TODO_NOT_FOUND',
  'INVALID_DATE_RANGE',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'INTERNAL_SERVER_ERROR',
];

describe('src/utils/errorCodes.js', () => {
  it('필수 에러 코드 12개가 모두 정의되어 있다', () => {
    for (const code of REQUIRED_CODES) {
      expect(errorCodes).toHaveProperty(code);
    }
    expect(REQUIRED_CODES.length).toBe(12);
  });

  it('모든 에러 코드 값이 문자열이다', () => {
    for (const code of REQUIRED_CODES) {
      expect(typeof errorCodes[code]).toBe('string');
    }
  });
});
