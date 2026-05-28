'use strict';

jest.mock('../../src/service/category.service');
jest.mock('../../src/utils/jwt');

const categoryService = require('../../src/service/category.service');
const { verifyToken } = require('../../src/utils/jwt');
const request = require('supertest');
const app = require('../../src/app');
const AppError = require('../../src/utils/AppError');

const VALID_TOKEN = 'valid-token';
const MOCK_USER = { id: 'user-uuid', email: 'test@example.com' };

beforeEach(() => {
  jest.clearAllMocks();
  verifyToken.mockReturnValue(MOCK_USER);
});

// ──────────────────────────────────────────────
// GET /api/categories
// ──────────────────────────────────────────────
describe('GET /api/categories', () => {
  const endpoint = '/api/categories';

  it('1. 정상 조회 → 200, { categories: [...] }', async () => {
    const mockCategories = [
      { id: 'cat-1', name: '기본', is_default: true },
      { id: 'cat-2', name: '업무', is_default: false },
    ];
    categoryService.getCategories.mockResolvedValue(mockCategories);

    const res = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ categories: mockCategories });
  });

  it('2. 토큰 없음 → 401', async () => {
    const res = await request(app).get(endpoint);

    expect(res.status).toBe(401);
  });
});

// ──────────────────────────────────────────────
// POST /api/categories
// ──────────────────────────────────────────────
describe('POST /api/categories', () => {
  const endpoint = '/api/categories';

  it('3. 정상 생성 → 201, { category: { ... } }', async () => {
    const mockCategory = { id: 'cat-3', name: '새 카테고리', is_default: false };
    categoryService.createCategory.mockResolvedValue(mockCategory);

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ name: '새 카테고리' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ category: mockCategory });
  });

  it('4. name 누락 → 400, code: VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('5. name 100자 초과 → 400, code: VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ name: 'a'.repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

// ──────────────────────────────────────────────
// PATCH /api/categories/:id
// ──────────────────────────────────────────────
describe('PATCH /api/categories/:id', () => {
  const endpoint = '/api/categories/cat-1';

  it('6. 정상 수정 → 200, { category: { ... } }', async () => {
    const mockCategory = { id: 'cat-1', name: '수정된 이름', is_default: false };
    categoryService.updateCategory.mockResolvedValue(mockCategory);

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ name: '수정된 이름' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ category: mockCategory });
  });

  it('7. name 누락 → 400', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('8. 기본 카테고리 수정 → 422, code: DEFAULT_CATEGORY_NOT_MODIFIABLE', async () => {
    categoryService.updateCategory.mockRejectedValue(
      new AppError(422, 'DEFAULT_CATEGORY_NOT_MODIFIABLE', '기본 카테고리는 수정할 수 없습니다.')
    );

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ name: '수정 시도' });

    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({ code: 'DEFAULT_CATEGORY_NOT_MODIFIABLE' });
  });

  it('9. 타 사용자 카테고리 → 403, code: FORBIDDEN', async () => {
    categoryService.updateCategory.mockRejectedValue(
      new AppError(403, 'FORBIDDEN', '접근 권한이 없습니다.')
    );

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ name: '수정 시도' });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' });
  });

  it('10. 카테고리 없음 → 404, code: CATEGORY_NOT_FOUND', async () => {
    categoryService.updateCategory.mockRejectedValue(
      new AppError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.')
    );

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ name: '수정 시도' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'CATEGORY_NOT_FOUND' });
  });
});

// ──────────────────────────────────────────────
// DELETE /api/categories/:id
// ──────────────────────────────────────────────
describe('DELETE /api/categories/:id', () => {
  const endpoint = '/api/categories/cat-1';

  it('11. 정상 삭제 → 200, { message: "카테고리가 삭제되었습니다." }', async () => {
    categoryService.deleteCategory.mockResolvedValue(undefined);

    const res = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: '카테고리가 삭제되었습니다.' });
  });

  it('12. 기본 카테고리 삭제 → 422, code: DEFAULT_CATEGORY_NOT_DELETABLE', async () => {
    categoryService.deleteCategory.mockRejectedValue(
      new AppError(422, 'DEFAULT_CATEGORY_NOT_DELETABLE', '기본 카테고리는 삭제할 수 없습니다.')
    );

    const res = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({ code: 'DEFAULT_CATEGORY_NOT_DELETABLE' });
  });

  it('13. 타 사용자 카테고리 → 403, code: FORBIDDEN', async () => {
    categoryService.deleteCategory.mockRejectedValue(
      new AppError(403, 'FORBIDDEN', '접근 권한이 없습니다.')
    );

    const res = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' });
  });
});
