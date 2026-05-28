'use strict';

jest.mock('../../src/config/database');
const db = require('../../src/config/database');
const todoRepo = require('../../src/repository/todo.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('todoRepository.create', () => {
  it('6개 필드를 파라미터 바인딩으로 INSERT 쿼리를 호출하고 rows[0]를 반환한다', async () => {
    const mockTodo = { id: 1, user_id: 10, category_id: 2, title: '할일', description: '설명', start_date: '2026-05-28', end_date: '2026-05-30' };
    db.query.mockResolvedValue({ rows: [mockTodo] });

    const result = await todoRepo.create({
      userId: 10,
      categoryId: 2,
      title: '할일',
      description: '설명',
      startDate: '2026-05-28',
      endDate: '2026-05-30',
    });

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO todos (user_id, category_id, title, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [10, 2, '할일', '설명', '2026-05-28', '2026-05-30']
    );
    expect(result).toEqual(mockTodo);
  });
});

describe('todoRepository.findById', () => {
  it('올바른 SQL과 파라미터로 db.query를 호출하고 rows[0]를 반환한다', async () => {
    const mockTodo = { id: 1, title: '할일' };
    db.query.mockResolvedValue({ rows: [mockTodo] });

    const result = await todoRepo.findById(1);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM todos WHERE id = $1',
      [1]
    );
    expect(result).toEqual(mockTodo);
  });

  it('결과가 없으면 undefined를 반환한다', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const result = await todoRepo.findById(999);

    expect(result).toBeUndefined();
  });
});

describe('todoRepository.findByUserId', () => {
  it('user_id 조건과 created_at DESC 정렬로 SELECT 쿼리를 호출하고 rows 배열을 반환한다', async () => {
    const mockTodos = [{ id: 2, title: 'B' }, { id: 1, title: 'A' }];
    db.query.mockResolvedValue({ rows: mockTodos });

    const result = await todoRepo.findByUserId(10);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [10]
    );
    expect(result).toEqual(mockTodos);
  });
});

describe('todoRepository.findByUserIdAndCategory', () => {
  it('user_id와 category_id 2개 파라미터로 SELECT 쿼리를 호출하고 rows 배열을 반환한다', async () => {
    const mockTodos = [{ id: 1, category_id: 2 }];
    db.query.mockResolvedValue({ rows: mockTodos });

    const result = await todoRepo.findByUserIdAndCategory(10, 2);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM todos WHERE user_id = $1 AND category_id = $2 ORDER BY created_at DESC',
      [10, 2]
    );
    expect(result).toEqual(mockTodos);
  });
});

describe('todoRepository.findByUserIdAndStatus', () => {
  it('not_started: is_completed=false 이고 start_date > KST 오늘 조건 SQL을 호출한다', async () => {
    const mockTodos = [{ id: 1, is_completed: false }];
    db.query.mockResolvedValue({ rows: mockTodos });

    const result = await todoRepo.findByUserIdAndStatus(10, 'not_started');

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('is_completed = false'),
      [10]
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('start_date >'),
      [10]
    );
    expect(result).toEqual(mockTodos);
  });

  it('in_progress: start_date <= KST 오늘 AND end_date >= KST 오늘 범위 조건 SQL을 호출한다', async () => {
    const mockTodos = [{ id: 2, is_completed: false }];
    db.query.mockResolvedValue({ rows: mockTodos });

    const result = await todoRepo.findByUserIdAndStatus(10, 'in_progress');

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('start_date <='),
      [10]
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('end_date >='),
      [10]
    );
    expect(result).toEqual(mockTodos);
  });

  it('completed: is_completed=true 조건 SQL을 호출한다', async () => {
    const mockTodos = [{ id: 3, is_completed: true }];
    db.query.mockResolvedValue({ rows: mockTodos });

    const result = await todoRepo.findByUserIdAndStatus(10, 'completed');

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('is_completed = true'),
      [10]
    );
    expect(result).toEqual(mockTodos);
  });

  it('overdue: is_completed=false 이고 end_date < KST 오늘 조건 SQL을 호출한다', async () => {
    const mockTodos = [{ id: 4, is_completed: false }];
    db.query.mockResolvedValue({ rows: mockTodos });

    const result = await todoRepo.findByUserIdAndStatus(10, 'overdue');

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('end_date <'),
      [10]
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('is_completed = false'),
      [10]
    );
    expect(result).toEqual(mockTodos);
  });

  it('알 수 없는 status 값이면 빈 배열을 반환하고 db.query를 호출하지 않는다', async () => {
    const result = await todoRepo.findByUserIdAndStatus(10, 'unknown');

    expect(db.query).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

describe('todoRepository.update', () => {
  it('title만 전달하면 title과 updated_at을 SET하는 UPDATE 쿼리를 호출한다', async () => {
    const mockTodo = { id: 1, title: '수정된 할일' };
    db.query.mockResolvedValue({ rows: [mockTodo] });

    const result = await todoRepo.update(1, { title: '수정된 할일' });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE todos SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['수정된 할일', 1]
    );
    expect(result).toEqual(mockTodo);
  });

  it('isCompleted만 전달하면 is_completed와 updated_at을 SET하는 UPDATE 쿼리를 호출한다', async () => {
    const mockTodo = { id: 1, is_completed: true };
    db.query.mockResolvedValue({ rows: [mockTodo] });

    const result = await todoRepo.update(1, { isCompleted: true });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE todos SET is_completed = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [true, 1]
    );
    expect(result).toEqual(mockTodo);
  });

  it('여러 필드를 전달하면 해당 필드들 모두 SET하는 UPDATE 쿼리를 호출한다', async () => {
    const mockTodo = { id: 1, title: '새 제목', description: '새 설명', category_id: 3 };
    db.query.mockResolvedValue({ rows: [mockTodo] });

    const result = await todoRepo.update(1, {
      title: '새 제목',
      description: '새 설명',
      categoryId: 3,
    });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE todos SET title = $1, description = $2, category_id = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      ['새 제목', '새 설명', 3, 1]
    );
    expect(result).toEqual(mockTodo);
  });

  it('startDate와 endDate를 전달하면 start_date, end_date를 SET하는 UPDATE 쿼리를 호출한다', async () => {
    const mockTodo = { id: 1, start_date: '2026-06-01', end_date: '2026-06-10' };
    db.query.mockResolvedValue({ rows: [mockTodo] });

    const result = await todoRepo.update(1, { startDate: '2026-06-01', endDate: '2026-06-10' });

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE todos SET start_date = $1, end_date = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      ['2026-06-01', '2026-06-10', 1]
    );
    expect(result).toEqual(mockTodo);
  });

  it('빈 fields 전달 시 findById를 호출하여 반환한다', async () => {
    const mockTodo = { id: 1, title: '원본' };
    db.query.mockResolvedValue({ rows: [mockTodo] });

    const result = await todoRepo.update(1, {});

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM todos WHERE id = $1',
      [1]
    );
    expect(result).toEqual(mockTodo);
  });
});

describe('todoRepository.updateCategory', () => {
  it('category_id와 todoId 파라미터로 UPDATE 쿼리를 호출하고 rows[0]를 반환한다', async () => {
    const mockTodo = { id: 1, category_id: 5 };
    db.query.mockResolvedValue({ rows: [mockTodo] });

    const result = await todoRepo.updateCategory(1, 5);

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE todos SET category_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [5, 1]
    );
    expect(result).toEqual(mockTodo);
  });
});

describe('todoRepository.deleteById', () => {
  it('올바른 파라미터로 DELETE 쿼리를 호출한다', async () => {
    db.query.mockResolvedValue({ rows: [] });

    await todoRepo.deleteById(1);

    expect(db.query).toHaveBeenCalledWith(
      'DELETE FROM todos WHERE id = $1',
      [1]
    );
  });
});
