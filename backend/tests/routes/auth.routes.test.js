'use strict';

jest.mock('../../src/service/auth.service');
jest.mock('../../src/utils/jwt');

const authService = require('../../src/service/auth.service');
const { verifyToken } = require('../../src/utils/jwt');
const request = require('supertest');
const app = require('../../src/app');

const VALID_TOKEN = 'valid-token';
const MOCK_USER = { id: 'user-id-1', email: 'test@example.com' };

beforeEach(() => {
  jest.clearAllMocks();
  // authMiddleware가 사용하는 verifyToken을 mock 처리
  verifyToken.mockImplementation((token) => {
    if (token === VALID_TOKEN) {
      return MOCK_USER;
    }
    const err = new Error('invalid token');
    err.name = 'JsonWebTokenError';
    throw err;
  });
});

// ──────────────────────────────────────────────
// POST /api/auth/signup
// ──────────────────────────────────────────────
describe('POST /api/auth/signup', () => {
  const endpoint = '/api/auth/signup';

  it('1. 정상 가입 → 201, { user: { id, email, name } }', async () => {
    authService.signup.mockResolvedValue({ id: 'user-id-1', email: 'test@example.com', name: '홍길동' });

    const res = await request(app).post(endpoint).send({
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ user: { id: 'user-id-1', email: 'test@example.com', name: '홍길동' } });
  });

  it('2. email 누락 → 400, code: VALIDATION_ERROR', async () => {
    const res = await request(app).post(endpoint).send({ password: 'password123', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('3. email 형식 오류 → 400, code: VALIDATION_ERROR', async () => {
    const res = await request(app).post(endpoint).send({ email: 'not-an-email', password: 'password123', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('4. password 8자 미만 → 400, code: VALIDATION_ERROR', async () => {
    const res = await request(app).post(endpoint).send({ email: 'test@example.com', password: 'short', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('5. name 누락 → 400, code: VALIDATION_ERROR', async () => {
    const res = await request(app).post(endpoint).send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('6. 이메일 중복(서비스가 AppError EMAIL_ALREADY_EXISTS throw) → 409', async () => {
    const AppError = require('../../src/utils/AppError');
    authService.signup.mockRejectedValue(new AppError(409, 'EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다.'));

    const res = await request(app).post(endpoint).send({
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
    });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' });
  });
});

// ──────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  const endpoint = '/api/auth/login';

  it('7. 정상 로그인 → 200, { token, user: { language, themeMode } } 포함', async () => {
    authService.login.mockResolvedValue({
      token: 'jwt-token',
      user: { id: 'user-id-1', email: 'test@example.com', name: '홍길동', language: 'ko', themeMode: 'light' },
    });

    const res = await request(app).post(endpoint).send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('jwt-token');
    expect(res.body.user).toMatchObject({ language: 'ko', themeMode: 'light' });
  });

  it('8. email 누락 → 400', async () => {
    const res = await request(app).post(endpoint).send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('9. 인증 실패(서비스가 AppError INVALID_CREDENTIALS throw) → 401', async () => {
    const AppError = require('../../src/utils/AppError');
    authService.login.mockRejectedValue(new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.'));

    const res = await request(app).post(endpoint).send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });
});

// ──────────────────────────────────────────────
// POST /api/auth/logout
// ──────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
  const endpoint = '/api/auth/logout';

  it('10. 유효한 토큰 → 200, { message: "로그아웃 되었습니다." }', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: '로그아웃 되었습니다.' });
  });

  it('11. 토큰 없음 → 401', async () => {
    const res = await request(app).post(endpoint);

    expect(res.status).toBe(401);
  });
});

// ──────────────────────────────────────────────
// PATCH /api/users/me
// ──────────────────────────────────────────────
describe('PATCH /api/users/me', () => {
  const endpoint = '/api/users/me';

  it('12. 정상 수정 → 200, { user: { id, email, name } }', async () => {
    authService.updateProfile.mockResolvedValue({ id: 'user-id-1', email: 'test@example.com', name: '새이름' });

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ name: '새이름' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ user: { id: 'user-id-1', email: 'test@example.com', name: '새이름' } });
  });

  it('13. 토큰 없음 → 401', async () => {
    const res = await request(app).patch(endpoint).send({ name: '새이름' });

    expect(res.status).toBe(401);
  });

  it('14. password 8자 미만 → 400', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
