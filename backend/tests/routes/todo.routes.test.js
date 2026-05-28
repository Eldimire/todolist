'use strict';

jest.mock('../../src/service/todo.service');
jest.mock('../../src/utils/jwt');

const todoService = require('../../src/service/todo.service');
const { verifyToken } = require('../../src/utils/jwt');
const request = require('supertest');
const app = require('../../src/app');
const AppError = require('../../src/utils/AppError');

const VALID_TOKEN = 'valid-token';
const mockUserId = 'user-uuid';
const mockTodoId = 'todo-uuid';
const mockTodo = { id: mockTodoId, user_id: mockUserId, title: '테스트 할일', is_completed: false };

beforeEach(() => {
  jest.clearAllMocks();
  verifyToken.mockReturnValue({ id: mockUserId, email: 'test@example.com' });
});

// ──────────────────────────────────────────────
// GET /api/todos
// ──────────────────────────────────────────────
describe('GET /api/todos', () => {
  const endpoint = '/api/todos';

  it('1. 필터 없음 → 200, { todos: [...] }', async () => {
    todoService.getTodos.mockResolvedValue([mockTodo]);

    const res = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ todos: [mockTodo] });
    expect(todoService.getTodos).toHaveBeenCalledWith(mockUserId, { categoryId: undefined, status: undefined });
  });

  it('2. ?categoryId=uuid → 200, categoryId 필터로 서비스 호출', async () => {
    const catId = 'cat-uuid';
    todoService.getTodos.mockResolvedValue([mockTodo]);

    const res = await request(app)
      .get(`${endpoint}?categoryId=${catId}`)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(todoService.getTodos).toHaveBeenCalledWith(mockUserId, { categoryId: catId, status: undefined });
  });

  it('3. ?status=in_progress → 200, status 필터로 서비스 호출', async () => {
    todoService.getTodos.mockResolvedValue([mockTodo]);

    const res = await request(app)
      .get(`${endpoint}?status=in_progress`)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(todoService.getTodos).toHaveBeenCalledWith(mockUserId, { categoryId: undefined, status: 'in_progress' });
  });

  it('4. 토큰 없음 → 401', async () => {
    const res = await request(app).get(endpoint);

    expect(res.status).toBe(401);
  });
});

// ──────────────────────────────────────────────
// POST /api/todos
// ──────────────────────────────────────────────
describe('POST /api/todos', () => {
  const endpoint = '/api/todos';

  it('5. 정상 생성(categoryId 포함) → 201, { todo: { ... } }', async () => {
    todoService.createTodo.mockResolvedValue(mockTodo);

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: '테스트 할일', categoryId: 'cat-uuid', startDate: '2026-05-01', endDate: '2026-05-31' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ todo: mockTodo });
  });

  it('6. 정상 생성(categoryId 없음, 기본 카테고리 자동 적용) → 201', async () => {
    todoService.createTodo.mockResolvedValue(mockTodo);

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: '테스트 할일', startDate: '2026-05-01', endDate: '2026-05-31' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ todo: mockTodo });
  });

  it('7. title 누락 → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ startDate: '2026-05-01', endDate: '2026-05-31' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('8. title 200자 초과 → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: 'a'.repeat(201), startDate: '2026-05-01', endDate: '2026-05-31' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('9. description 2000자 초과 → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: '테스트', description: 'a'.repeat(2001), startDate: '2026-05-01', endDate: '2026-05-31' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('10. startDate 누락 → 400', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: '테스트 할일', endDate: '2026-05-31' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('11. 날짜 역전(서비스가 INVALID_DATE_RANGE AppError throw) → 422', async () => {
    todoService.createTodo.mockRejectedValue(
      new AppError(422, 'INVALID_DATE_RANGE', '종료일은 시작일보다 이전일 수 없습니다.')
    );

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: '테스트 할일', startDate: '2026-05-31', endDate: '2026-05-01' });

    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({ code: 'INVALID_DATE_RANGE' });
  });
});

// ──────────────────────────────────────────────
// PATCH /api/todos/:id
// ──────────────────────────────────────────────
describe('PATCH /api/todos/:id', () => {
  const endpoint = `/api/todos/${mockTodoId}`;

  it('12. 정상 수정 → 200, { todo: { ... } }', async () => {
    const updatedTodo = { ...mockTodo, title: '수정된 할일' };
    todoService.updateTodo.mockResolvedValue(updatedTodo);

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: '수정된 할일' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ todo: updatedTodo });
  });

  it('13. 타 사용자 할일(FORBIDDEN AppError) → 403', async () => {
    todoService.updateTodo.mockRejectedValue(
      new AppError(403, 'FORBIDDEN', '접근 권한이 없습니다.')
    );

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: '수정 시도' });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' });
  });

  it('14. 할일 없음(TODO_NOT_FOUND AppError) → 404', async () => {
    todoService.updateTodo.mockRejectedValue(
      new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.')
    );

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ title: '수정 시도' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'TODO_NOT_FOUND' });
  });
});

// ──────────────────────────────────────────────
// DELETE /api/todos/:id
// ──────────────────────────────────────────────
describe('DELETE /api/todos/:id', () => {
  const endpoint = `/api/todos/${mockTodoId}`;

  it('15. 정상 삭제 → 200, { message: "할일이 삭제되었습니다." }', async () => {
    todoService.deleteTodo.mockResolvedValue(undefined);

    const res = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: '할일이 삭제되었습니다.' });
  });

  it('16. 타 사용자 할일(FORBIDDEN AppError) → 403', async () => {
    todoService.deleteTodo.mockRejectedValue(
      new AppError(403, 'FORBIDDEN', '접근 권한이 없습니다.')
    );

    const res = await request(app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' });
  });
});

// ──────────────────────────────────────────────
// PATCH /api/todos/:id/complete
// ──────────────────────────────────────────────
describe('PATCH /api/todos/:id/complete', () => {
  const endpoint = `/api/todos/${mockTodoId}/complete`;

  it('17. 완료 토글 → 200, { todo: { ... } }', async () => {
    const toggledTodo = { ...mockTodo, is_completed: true };
    todoService.toggleComplete.mockResolvedValue(toggledTodo);

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ todo: toggledTodo });
  });

  it('18. 할일 없음(TODO_NOT_FOUND AppError) → 404', async () => {
    todoService.toggleComplete.mockRejectedValue(
      new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.')
    );

    const res = await request(app)
      .patch(endpoint)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'TODO_NOT_FOUND' });
  });
});
