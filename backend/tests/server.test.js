'use strict';

const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('200 응답 및 status: "ok" 포함', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});

describe('GET /nonexistent', () => {
  it('404 응답 및 code: "NOT_FOUND" 포함', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('CORS', () => {
  it('CORS 헤더 (Access-Control-Allow-Origin)가 응답에 포함되어야 한다', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});

describe('GET /api/nonexistent', () => {
  it('존재하지 않는 경로는 404를 반환해야 한다', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
