'use strict';

// pg.Pool mock
const mockQuery = jest.fn();
jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      query: mockQuery,
    })),
  };
});

// env mock
jest.mock('../../src/config/env', () => ({
  db: {
    host: 'localhost',
    port: 5432,
    name: 'todolist',
    user: 'todolist',
    password: 'todolist',
  },
}));

// logger mock
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};
jest.mock('../../src/utils/logger', () => mockLogger);

describe('src/config/database.js', () => {
  let db;

  beforeEach(() => {
    jest.resetModules();

    // mock 재등록 (resetModules 후에도 유지되도록)
    jest.mock('pg', () => {
      return {
        Pool: jest.fn().mockImplementation(() => ({
          query: mockQuery,
        })),
      };
    });
    jest.mock('../../src/config/env', () => ({
      db: {
        host: 'localhost',
        port: 5432,
        name: 'todolist',
        user: 'todolist',
        password: 'todolist',
      },
    }));
    jest.mock('../../src/utils/logger', () => mockLogger);

    mockQuery.mockReset();
    mockLogger.info.mockReset();
    mockLogger.error.mockReset();

    db = require('../../src/config/database');
  });

  it('query() 함수가 pool.query를 호출한다', async () => {
    const fakeResult = { rows: [{ now: new Date() }] };
    mockQuery.mockResolvedValueOnce(fakeResult);

    const result = await db.query('SELECT 1');

    expect(mockQuery).toHaveBeenCalledWith('SELECT 1', undefined);
    expect(result).toBe(fakeResult);
  });

  it('connect() 성공 시 logger.info를 호출한다', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ now: new Date() }] });

    await db.connect();

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Database connection established')
    );
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it('connect() 실패 시 logger.error를 호출한다', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection refused'));

    await db.connect();

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to connect'),
      'connection refused'
    );
    expect(mockLogger.info).not.toHaveBeenCalled();
  });
});
