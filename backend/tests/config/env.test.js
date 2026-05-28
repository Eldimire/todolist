'use strict';

const VALID_ENV = {
  NODE_ENV: 'test',
  PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'todolist',
  DB_USER: 'todolist',
  DB_PASSWORD: 'todolist',
  JWT_SECRET: 'todolist-jwt-secret-key-minimum-32chars-ok',
  JWT_EXPIRY: '7d',
  CORS_ORIGIN: 'http://localhost:5173',
};

function loadEnv() {
  jest.resetModules();
  return require('../../src/config/env');
}

describe('src/config/env.js', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // dotenv 파일 로드 방지: 테스트에서는 process.env를 직접 제어
    jest.mock('dotenv', () => ({ config: jest.fn() }));
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
    jest.unmock('dotenv');
  });

  it('모든 필수 환경변수가 있을 때 올바른 구조를 반환한다', () => {
    Object.assign(process.env, VALID_ENV);
    const env = loadEnv();

    expect(env.nodeEnv).toBe('test');
    expect(env.port).toBe(3000);
    expect(env.db).toEqual({
      host: 'localhost',
      port: 5432,
      name: 'todolist',
      user: 'todolist',
      password: 'todolist',
    });
    expect(env.jwt).toEqual({
      secret: 'todolist-jwt-secret-key-minimum-32chars-ok',
      expiry: '7d',
    });
    expect(env.corsOrigin).toBe('http://localhost:5173');
  });

  it('필수 환경변수 누락 시 Error를 throw하며 메시지에 누락된 키가 포함된다', () => {
    // DB_PASSWORD, JWT_SECRET 제거
    const partialEnv = { ...VALID_ENV };
    delete partialEnv.DB_PASSWORD;
    delete partialEnv.JWT_SECRET;

    // 기존 process.env에서 해당 키 제거
    delete process.env.DB_PASSWORD;
    delete process.env.JWT_SECRET;
    Object.assign(process.env, partialEnv);

    expect(() => loadEnv()).toThrow(/Missing required env vars/);
    expect(() => {
      jest.resetModules();
      require('../../src/config/env');
    }).toThrow(/DB_PASSWORD|JWT_SECRET/);
  });

  it('PORT와 DB_PORT가 정수로 변환된다', () => {
    Object.assign(process.env, VALID_ENV);
    const env = loadEnv();

    expect(typeof env.port).toBe('number');
    expect(Number.isInteger(env.port)).toBe(true);
    expect(typeof env.db.port).toBe('number');
    expect(Number.isInteger(env.db.port)).toBe(true);
  });
});
