'use strict';

require('../../src/config/env');
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/database');

function getKSTDateStr(offsetDays = 0) {
  const kst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  kst.setDate(kst.getDate() + offsetDays);
  return kst.toISOString().split('T')[0];
}

describe('US-01: 회원가입 → 로그인 → 할일 등록', () => {
  const email = `us01-${Date.now()}@test.local`;
  const password = 'Test1234!';

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('회원가입 → 로그인 → 할일 등록 시나리오', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email, password, name: 'US01 User' });
    expect(signupRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    const todoRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'US01 할일',
        startDate: getKSTDateStr(0),
        endDate: getKSTDateStr(1),
      });
    expect(todoRes.status).toBe(201);
    expect(todoRes.body.todo.category_id).toBeDefined();
  });
});

describe('US-02: 카테고리 생성 → 할일 등록(카테고리 지정) → 카테고리별 조회', () => {
  const email = `us02-${Date.now()}@test.local`;
  const password = 'Test1234!';
  let token;
  let categoryId;

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('카테고리 생성 → 할일 등록 → 카테고리별 조회 시나리오', async () => {
    await request(app).post('/api/auth/signup').send({ email, password, name: 'US02 User' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'US02 카테고리' });
    expect(catRes.status).toBe(201);
    categoryId = catRes.body.category.id;

    const todoRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'US02 할일',
        startDate: getKSTDateStr(0),
        endDate: getKSTDateStr(1),
        categoryId,
      });
    expect(todoRes.status).toBe(201);
    expect(todoRes.body.todo.category_id).toBe(categoryId);

    const listRes = await request(app)
      .get(`/api/todos?categoryId=${categoryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    const titles = listRes.body.todos.map((t) => t.title);
    expect(titles).toContain('US02 할일');
  });
});

describe('US-03: 진행 중 필터 조회 → 완료 처리 → 완료 필터 확인', () => {
  const email = `us03-${Date.now()}@test.local`;
  const password = 'Test1234!';
  let token;
  let todoId;

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('진행 중 → 완료 처리 → 완료 필터 시나리오', async () => {
    await request(app).post('/api/auth/signup').send({ email, password, name: 'US03 User' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    const todoRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'US03 진행 중 할일',
        startDate: getKSTDateStr(0),
        endDate: getKSTDateStr(1),
      });
    expect(todoRes.status).toBe(201);
    todoId = todoRes.body.todo.id;

    const inProgressRes = await request(app)
      .get('/api/todos?status=in_progress')
      .set('Authorization', `Bearer ${token}`);
    expect(inProgressRes.status).toBe(200);
    const inProgressIds = inProgressRes.body.todos.map((t) => t.id);
    expect(inProgressIds).toContain(todoId);

    const completeRes = await request(app)
      .patch(`/api/todos/${todoId}/complete`)
      .set('Authorization', `Bearer ${token}`);
    expect(completeRes.status).toBe(200);

    const completedRes = await request(app)
      .get('/api/todos?status=completed')
      .set('Authorization', `Bearer ${token}`);
    expect(completedRes.status).toBe(200);
    const completedIds = completedRes.body.todos.map((t) => t.id);
    expect(completedIds).toContain(todoId);
  });
});

describe('US-04: 기한 초과 조회 → 날짜 수정 → 삭제', () => {
  const email = `us04-${Date.now()}@test.local`;
  const password = 'Test1234!';
  let token;
  let todoId;

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('기한 초과 → 날짜 수정 → 삭제 시나리오', async () => {
    await request(app).post('/api/auth/signup').send({ email, password, name: 'US04 User' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    const todoRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'US04 기한 초과 할일',
        startDate: getKSTDateStr(-7),
        endDate: getKSTDateStr(-1),
      });
    expect(todoRes.status).toBe(201);
    todoId = todoRes.body.todo.id;

    const overdueRes = await request(app)
      .get('/api/todos?status=overdue')
      .set('Authorization', `Bearer ${token}`);
    expect(overdueRes.status).toBe(200);
    const overdueIds = overdueRes.body.todos.map((t) => t.id);
    expect(overdueIds).toContain(todoId);

    const patchRes = await request(app)
      .patch(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: getKSTDateStr(0),
        endDate: getKSTDateStr(1),
      });
    expect(patchRes.status).toBe(200);

    const deleteRes = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
  });
});

describe('US-06: 내 정보 수정 → 카테고리 삭제(하위 할일 재지정) → 로그아웃', () => {
  const email = `us06-${Date.now()}@test.local`;
  const password = 'Test1234!';
  let token;
  let categoryId;

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('내 정보 수정 → 카테고리 삭제 → 로그아웃 시나리오', async () => {
    await request(app).post('/api/auth/signup').send({ email, password, name: 'US06 User' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    const patchUserRes = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'US06 수정된 이름' });
    expect(patchUserRes.status).toBe(200);

    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'US06 삭제될 카테고리' });
    expect(catRes.status).toBe(201);
    categoryId = catRes.body.category.id;

    const todoRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'US06 재지정될 할일',
        startDate: getKSTDateStr(0),
        endDate: getKSTDateStr(1),
        categoryId,
      });
    expect(todoRes.status).toBe(201);

    const deleteCatRes = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteCatRes.status).toBe(200);

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);
  });
});

describe('공통 검증: 에러 응답 형식 및 인증 없이 접근 시 401', () => {
  it('JWT 없이 GET /api/todos 접근 시 401 반환', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('message');
  });

  it('JWT 없이 POST /api/categories 접근 시 401 반환', async () => {
    const res = await request(app).post('/api/categories').send({ name: '비인증', color: '#000' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('message');
  });

  it('JWT 없이 PATCH /api/users/me 접근 시 401 반환', async () => {
    const res = await request(app).patch('/api/users/me').send({ name: '비인증' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('message');
  });
});
