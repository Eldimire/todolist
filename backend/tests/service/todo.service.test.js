'use strict';

jest.mock('../../src/repository/todo.repository');
jest.mock('../../src/repository/category.repository');

const todoRepo = require('../../src/repository/todo.repository');
const categoryRepo = require('../../src/repository/category.repository');
const todoService = require('../../src/service/todo.service');
const errorCodes = require('../../src/utils/errorCodes');
const httpStatus = require('../../src/constants/httpStatus');

describe('todo.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // getTodos
  // ──────────────────────────────────────────────
  describe('getTodos', () => {
    it('필터 없음: findByUserId 호출', async () => {
      const mockTodos = [{ id: 1, title: '할일1', user_id: 10 }];
      todoRepo.findByUserId.mockResolvedValue(mockTodos);

      const result = await todoService.getTodos(10);

      expect(todoRepo.findByUserId).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockTodos);
    });

    it('categoryId 필터: findByUserIdAndCategory 호출', async () => {
      const mockTodos = [{ id: 2, title: '할일2', user_id: 10, category_id: 3 }];
      todoRepo.findByUserIdAndCategory.mockResolvedValue(mockTodos);

      const result = await todoService.getTodos(10, { categoryId: 3 });

      expect(todoRepo.findByUserIdAndCategory).toHaveBeenCalledWith(10, 3);
      expect(result).toEqual(mockTodos);
    });

    it('status 필터: findByUserIdAndStatus 호출', async () => {
      const mockTodos = [{ id: 3, title: '할일3', user_id: 10, is_completed: true }];
      todoRepo.findByUserIdAndStatus.mockResolvedValue(mockTodos);

      const result = await todoService.getTodos(10, { status: 'completed' });

      expect(todoRepo.findByUserIdAndStatus).toHaveBeenCalledWith(10, 'completed');
      expect(result).toEqual(mockTodos);
    });
  });

  // ──────────────────────────────────────────────
  // createTodo
  // ──────────────────────────────────────────────
  describe('createTodo', () => {
    it('categoryId 있음: todoRepo.create 호출 시 categoryId 그대로 사용', async () => {
      const mockTodo = { id: 1, title: '제목', category_id: 5, user_id: 10 };
      todoRepo.create.mockResolvedValue(mockTodo);

      const result = await todoService.createTodo(10, {
        title: '제목',
        description: '설명',
        categoryId: 5,
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      });

      expect(todoRepo.create).toHaveBeenCalledWith({
        userId: 10,
        categoryId: 5,
        title: '제목',
        description: '설명',
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      });
      expect(result).toEqual(mockTodo);
    });

    it('categoryId 없음: 기본 카테고리 자동 적용 확인', async () => {
      categoryRepo.findDefaultByUserId.mockResolvedValue({ id: 1, name: '기본', is_default: true, user_id: 10 });
      const mockTodo = { id: 2, title: '제목', category_id: 1, user_id: 10 };
      todoRepo.create.mockResolvedValue(mockTodo);

      await todoService.createTodo(10, {
        title: '제목',
        description: '설명',
        categoryId: undefined,
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      });

      expect(categoryRepo.findDefaultByUserId).toHaveBeenCalledWith(10);
      expect(todoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 1 })
      );
    });

    it('날짜 역전: INVALID_DATE_RANGE(422) throw', async () => {
      await expect(
        todoService.createTodo(10, {
          title: '제목',
          description: '설명',
          categoryId: 5,
          startDate: '2026-05-31',
          endDate: '2026-05-01',
        })
      ).rejects.toMatchObject({
        statusCode: httpStatus.UNPROCESSABLE_ENTITY,
        code: errorCodes.INVALID_DATE_RANGE,
      });
    });
  });

  // ──────────────────────────────────────────────
  // updateTodo
  // ──────────────────────────────────────────────
  describe('updateTodo', () => {
    it('정상 수정: todoRepo.update 호출', async () => {
      todoRepo.findById.mockResolvedValue({
        id: 1,
        user_id: 10,
        start_date: '2026-05-01',
        end_date: '2026-05-31',
        is_completed: false,
      });
      todoRepo.update.mockResolvedValue({ id: 1, title: '수정됨', user_id: 10 });

      const result = await todoService.updateTodo(10, 1, { title: '수정됨' });

      expect(todoRepo.update).toHaveBeenCalledWith(1, { title: '수정됨' });
      expect(result).toEqual({ id: 1, title: '수정됨', user_id: 10 });
    });

    it('할일 없음: TODO_NOT_FOUND(404) throw', async () => {
      todoRepo.findById.mockResolvedValue(null);

      await expect(
        todoService.updateTodo(10, 999, { title: '수정됨' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.NOT_FOUND,
        code: errorCodes.TODO_NOT_FOUND,
      });
    });

    it('타 사용자: FORBIDDEN(403) throw', async () => {
      todoRepo.findById.mockResolvedValue({ id: 1, user_id: 99, start_date: '2026-05-01', end_date: '2026-05-31' });

      await expect(
        todoService.updateTodo(10, 1, { title: '수정됨' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.FORBIDDEN,
        code: errorCodes.FORBIDDEN,
      });
    });

    it('날짜 역전: INVALID_DATE_RANGE(422) throw', async () => {
      todoRepo.findById.mockResolvedValue({
        id: 1,
        user_id: 10,
        start_date: '2026-05-01',
        end_date: '2026-05-31',
        is_completed: false,
      });

      await expect(
        todoService.updateTodo(10, 1, { startDate: '2026-06-01', endDate: '2026-05-01' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.UNPROCESSABLE_ENTITY,
        code: errorCodes.INVALID_DATE_RANGE,
      });
    });
  });

  // ──────────────────────────────────────────────
  // deleteTodo
  // ──────────────────────────────────────────────
  describe('deleteTodo', () => {
    it('정상 삭제: deleteById 호출', async () => {
      todoRepo.findById.mockResolvedValue({ id: 1, user_id: 10 });
      todoRepo.deleteById.mockResolvedValue();

      await todoService.deleteTodo(10, 1);

      expect(todoRepo.deleteById).toHaveBeenCalledWith(1);
    });

    it('할일 없음: TODO_NOT_FOUND(404) throw', async () => {
      todoRepo.findById.mockResolvedValue(null);

      await expect(
        todoService.deleteTodo(10, 999)
      ).rejects.toMatchObject({
        statusCode: httpStatus.NOT_FOUND,
        code: errorCodes.TODO_NOT_FOUND,
      });
    });

    it('타 사용자: FORBIDDEN(403) throw', async () => {
      todoRepo.findById.mockResolvedValue({ id: 1, user_id: 99 });

      await expect(
        todoService.deleteTodo(10, 1)
      ).rejects.toMatchObject({
        statusCode: httpStatus.FORBIDDEN,
        code: errorCodes.FORBIDDEN,
      });
    });
  });

  // ──────────────────────────────────────────────
  // toggleComplete
  // ──────────────────────────────────────────────
  describe('toggleComplete', () => {
    it('false→true 토글: isCompleted: true로 update 호출', async () => {
      todoRepo.findById.mockResolvedValue({ id: 1, user_id: 10, is_completed: false });
      todoRepo.update.mockResolvedValue({ id: 1, user_id: 10, is_completed: true });

      const result = await todoService.toggleComplete(10, 1);

      expect(todoRepo.update).toHaveBeenCalledWith(1, { isCompleted: true });
      expect(result).toEqual({ id: 1, user_id: 10, is_completed: true });
    });

    it('true→false 토글: isCompleted: false로 update 호출', async () => {
      todoRepo.findById.mockResolvedValue({ id: 1, user_id: 10, is_completed: true });
      todoRepo.update.mockResolvedValue({ id: 1, user_id: 10, is_completed: false });

      const result = await todoService.toggleComplete(10, 1);

      expect(todoRepo.update).toHaveBeenCalledWith(1, { isCompleted: false });
      expect(result).toEqual({ id: 1, user_id: 10, is_completed: false });
    });

    it('할일 없음: TODO_NOT_FOUND(404) throw', async () => {
      todoRepo.findById.mockResolvedValue(null);

      await expect(
        todoService.toggleComplete(10, 999)
      ).rejects.toMatchObject({
        statusCode: httpStatus.NOT_FOUND,
        code: errorCodes.TODO_NOT_FOUND,
      });
    });

    it('타 사용자: FORBIDDEN(403) throw', async () => {
      todoRepo.findById.mockResolvedValue({ id: 1, user_id: 99, is_completed: false });

      await expect(
        todoService.toggleComplete(10, 1)
      ).rejects.toMatchObject({
        statusCode: httpStatus.FORBIDDEN,
        code: errorCodes.FORBIDDEN,
      });
    });
  });
});
