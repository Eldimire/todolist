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
