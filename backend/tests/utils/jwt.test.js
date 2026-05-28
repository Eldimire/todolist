'use strict';

const jwtLib = require('jsonwebtoken');

// jest.mock factory 내에서는 외부 변수 참조 불가 → 리터럴 사용
jest.mock('../../src/config/env', () => ({
  jwt: {
    secret: 'test-secret-key-minimum-32chars-ok!!',
    expiry: '1h',
  },
}));

describe('src/utils/jwt.js', () => {
  let generateToken, verifyToken;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('../../src/config/env', () => ({
      jwt: {
        secret: 'test-secret-key-minimum-32chars-ok!!',
        expiry: '1h',
      },
    }));
    ({ generateToken, verifyToken } = require('../../src/utils/jwt'));
  });

  it('generateToken은 문자열을 반환한다', () => {
    const token = generateToken({ userId: 1 });
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('verifyToken은 생성된 토큰에서 원본 payload를 반환한다', () => {
    const payload = { userId: 42, role: 'user' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(42);
    expect(decoded.role).toBe('user');
  });

  it('유효하지 않은 토큰은 에러를 throw한다', () => {
    expect(() => verifyToken('invalid.token.value')).toThrow();
  });

  it('만료된 토큰은 TokenExpiredError를 throw한다', async () => {
    const expiredToken = jwtLib.sign(
      { userId: 99 },
      'test-secret-key-minimum-32chars-ok!!',
      { expiresIn: '1ms' }
    );
    await new Promise((r) => setTimeout(r, 10));
    expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
  });
});
