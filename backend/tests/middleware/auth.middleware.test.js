'use strict';

const jwtLib = require('jsonwebtoken');

// jest.mock 팩토리 내에서 외부 변수 참조 불가 → 리터럴 사용
const TEST_SECRET = 'test-secret-key-minimum-32chars-ok!!';

jest.mock('../../src/config/env', () => ({
  jwt: {
    secret: 'test-secret-key-minimum-32chars-ok!!',
    expiry: '1h',
  },
}));

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const mockReq = (authHeader) => ({ headers: { authorization: authHeader } });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('auth.middleware.js', () => {
  let authMiddleware;
  let mockNext;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../src/config/env', () => ({
      jwt: {
        secret: 'test-secret-key-minimum-32chars-ok!!',
        expiry: '1h',
      },
    }));

    jest.mock('../../src/utils/logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }));

    authMiddleware = require('../../src/middleware/auth.middleware');
    mockNext = jest.fn();
  });

  it('Authorization 헤더가 없으면 401과 UNAUTHORIZED 코드를 반환한다', () => {
    const req = mockReq(undefined);
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Bearer 없이 토큰만 있으면 401을 반환한다', () => {
    const req = mockReq('sometoken');
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('유효한 토큰이면 next()를 호출하고 req.user를 설정한다', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = jwtLib.sign(payload, TEST_SECRET, { expiresIn: '1h' });
    const req = mockReq(`Bearer ${token}`);
    req.user = undefined;
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 1, email: 'test@example.com' });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('만료된 토큰이면 401과 "만료된" 메시지를 반환한다', async () => {
    const expiredToken = jwtLib.sign(
      { id: 99, email: 'expired@example.com' },
      TEST_SECRET,
      { expiresIn: '1ms' }
    );
    await new Promise((r) => setTimeout(r, 10));

    const req = mockReq(`Bearer ${expiredToken}`);
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.code).toBe('UNAUTHORIZED');
    expect(jsonArg.message).toContain('만료된');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('유효하지 않은 토큰 문자열이면 401과 "유효하지 않은" 메시지를 반환한다', () => {
    const req = mockReq('Bearer invalid.token.string');
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.code).toBe('UNAUTHORIZED');
    expect(jsonArg.message).toContain('유효하지 않은');
    expect(mockNext).not.toHaveBeenCalled();
  });
});
