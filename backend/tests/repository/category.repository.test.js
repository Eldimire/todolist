'use strict';

jest.mock('../../src/config/database');
const db = require('../../src/config/database');
const categoryRepo = require('../../src/repository/category.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('categoryRepository.create', () => {
  it('userId, name, isDefault 파라미터 바인딩으로 INSERT 쿼리를 호출하고 rows[0]를 반환한다', async () => {
    const mockCategory = { id: 1, user_id: 10, name: '업무', is_default: false };
    db.query.mockResolvedValue({ rows: [mockCategory] });

    const result = await categoryRepo.create({ userId: 10, name: '업무', isDefault: false });

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO categories (user_id, name, is_default) VALUES ($1, $2, $3) RETURNING *',
      [10, '업무', false]
    );
    expect(result).toEqual(mockCategory);
  });
});

describe('categoryRepository.findById', () => {
  it('올바른 SQL과 파라미터로 db.query를 호출하고 rows[0]를 반환한다', async () => {
    const mockCategory = { id: 1, user_id: 10, name: '업무' };
    db.query.mockResolvedValue({ rows: [mockCategory] });

    const result = await categoryRepo.findById(1);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM categories WHERE id = $1',
      [1]
    );
    expect(result).toEqual(mockCategory);
  });

  it('결과가 없으면 undefined를 반환한다', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const result = await categoryRepo.findById(999);

    expect(result).toBeUndefined();
  });
});

describe('categoryRepository.findByUserId', () => {
  it('user_id 조건과 정렬 ORDER BY를 포함한 SELECT 쿼리를 호출하고 rows 배열을 반환한다', async () => {
    const mockCategories = [
      { id: 1, user_id: 10, name: '전체', is_default: true },
      { id: 2, user_id: 10, name: '업무', is_default: false },
    ];
    db.query.mockResolvedValue({ rows: mockCategories });

    const result = await categoryRepo.findByUserId(10);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC',
      [10]
    );
    expect(result).toEqual(mockCategories);
  });
});

describe('categoryRepository.findDefaultByUserId', () => {
  it('is_default = true 조건을 포함한 SQL로 db.query를 호출하고 rows[0]를 반환한다', async () => {
    const mockDefault = { id: 1, user_id: 10, name: '전체', is_default: true };
    db.query.mockResolvedValue({ rows: [mockDefault] });

    const result = await categoryRepo.findDefaultByUserId(10);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM categories WHERE user_id = $1 AND is_default = true',
      [10]
    );
    expect(result).toEqual(mockDefault);
  });
});

describe('categoryRepository.update', () => {
  it('name 파라미터 바인딩으로 UPDATE 쿼리를 호출하고 rows[0]를 반환한다', async () => {
    const mockCategory = { id: 1, name: '개인' };
    db.query.mockResolvedValue({ rows: [mockCategory] });

    const result = await categoryRepo.update(1, { name: '개인' });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      ['개인', 1]
    );
    expect(result).toEqual(mockCategory);
  });
});

describe('categoryRepository.deleteById', () => {
  it('올바른 파라미터로 DELETE 쿼리를 호출한다', async () => {
    db.query.mockResolvedValue({ rows: [] });

    await categoryRepo.deleteById(1);

    expect(db.query).toHaveBeenCalledWith(
      'DELETE FROM categories WHERE id = $1',
      [1]
    );
  });
});
