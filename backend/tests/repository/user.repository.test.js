'use strict';

jest.mock('../../src/config/database');
const db = require('../../src/config/database');
const userRepo = require('../../src/repository/user.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('userRepository.findByEmail', () => {
  it('올바른 SQL과 파라미터로 db.query를 호출하고 rows[0]를 반환한다', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.findByEmail('test@example.com');

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE email = $1',
      ['test@example.com']
    );
    expect(result).toEqual(mockUser);
  });

  it('결과가 없으면 undefined를 반환한다', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const result = await userRepo.findByEmail('notfound@example.com');

    expect(result).toBeUndefined();
  });
});

describe('userRepository.findById', () => {
  it('올바른 SQL과 파라미터로 db.query를 호출하고 rows[0]를 반환한다', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.findById(1);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1',
      [1]
    );
    expect(result).toEqual(mockUser);
  });

  it('결과가 없으면 undefined를 반환한다', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const result = await userRepo.findById(999);

    expect(result).toBeUndefined();
  });
});

describe('userRepository.create', () => {
  it('INSERT 쿼리를 올바른 파라미터로 호출하고 rows[0]를 반환한다', async () => {
    const mockUser = { id: 1, email: 'new@example.com', name: 'New User' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.create({
      email: 'new@example.com',
      password: 'hashed_pw',
      name: 'New User',
    });

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      ['new@example.com', 'hashed_pw', 'New User']
    );
    expect(result).toEqual(mockUser);
  });
});

describe('userRepository.update', () => {
  it('name만 전달하면 name과 updated_at을 SET하는 UPDATE 쿼리를 호출한다', async () => {
    const mockUser = { id: 1, name: 'Updated' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.update(1, { name: 'Updated' });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['Updated', 1]
    );
    expect(result).toEqual(mockUser);
  });

  it('password만 전달하면 password와 updated_at을 SET하는 UPDATE 쿼리를 호출한다', async () => {
    const mockUser = { id: 1, password: 'new_hashed' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.update(1, { password: 'new_hashed' });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['new_hashed', 1]
    );
    expect(result).toEqual(mockUser);
  });

  it('name과 password 모두 전달하면 두 필드 모두 SET하는 UPDATE 쿼리를 호출한다', async () => {
    const mockUser = { id: 1, name: 'Updated', password: 'new_hashed' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.update(1, { name: 'Updated', password: 'new_hashed' });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE users SET name = $1, password = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      ['Updated', 'new_hashed', 1]
    );
    expect(result).toEqual(mockUser);
  });

  it('빈 fields 전달 시 findById를 호출하여 반환한다', async () => {
    const mockUser = { id: 1, name: 'Original' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.update(1, {});

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1',
      [1]
    );
    expect(result).toEqual(mockUser);
  });
});

describe('userRepository.update - language/themeMode', () => {
  it('language 업데이트 → language = $1로 SET절 포함 UPDATE 쿼리를 호출한다', async () => {
    const mockUser = { id: 1, language: 'en' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.update(1, { language: 'en' });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE users SET language = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['en', 1]
    );
    expect(result).toEqual(mockUser);
  });

  it('themeMode 업데이트 → theme_mode = $1로 SET절 포함 UPDATE 쿼리를 호출한다', async () => {
    const mockUser = { id: 1, theme_mode: 'dark' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const result = await userRepo.update(1, { themeMode: 'dark' });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE users SET theme_mode = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['dark', 1]
    );
    expect(result).toEqual(mockUser);
  });
});
