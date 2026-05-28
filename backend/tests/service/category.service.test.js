'use strict';

jest.mock('../../src/repository/category.repository');
jest.mock('../../src/repository/todo.repository');

const categoryRepo = require('../../src/repository/category.repository');
const todoRepo = require('../../src/repository/todo.repository');
const categoryService = require('../../src/service/category.service');
const errorCodes = require('../../src/utils/errorCodes');
const httpStatus = require('../../src/constants/httpStatus');

describe('category.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // getCategories
  // ──────────────────────────────────────────────
  describe('getCategories', () => {
    it('findByUserId 호출 후 결과 반환', async () => {
      const mockCategories = [
        { id: 1, name: '기본', is_default: true, user_id: 10 },
        { id: 2, name: '업무', is_default: false, user_id: 10 },
      ];
      categoryRepo.findByUserId.mockResolvedValue(mockCategories);

      const result = await categoryService.getCategories(10);

      expect(categoryRepo.findByUserId).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockCategories);
    });
  });

  // ──────────────────────────────────────────────
  // createCategory
  // ──────────────────────────────────────────────
  describe('createCategory', () => {
    it('categoryRepo.create 호출 시 isDefault=false 확인', async () => {
      const mockCategory = { id: 5, name: '개인', is_default: false, user_id: 10 };
      categoryRepo.create.mockResolvedValue(mockCategory);

      const result = await categoryService.createCategory(10, { name: '개인' });

      expect(categoryRepo.create).toHaveBeenCalledWith({ userId: 10, name: '개인', isDefault: false });
      expect(result).toEqual(mockCategory);
    });
  });

  // ──────────────────────────────────────────────
  // updateCategory
  // ──────────────────────────────────────────────
  describe('updateCategory', () => {
    it('정상 수정: update 호출 후 반환값 확인', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 2, name: '업무', is_default: false, user_id: 10 });
      categoryRepo.update.mockResolvedValue({ id: 2, name: '변경됨', is_default: false, user_id: 10 });

      const result = await categoryService.updateCategory(10, 2, { name: '변경됨' });

      expect(categoryRepo.update).toHaveBeenCalledWith(2, { name: '변경됨' });
      expect(result).toEqual({ id: 2, name: '변경됨', is_default: false, user_id: 10 });
    });

    it('카테고리 없음: CATEGORY_NOT_FOUND(404) throw', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(
        categoryService.updateCategory(10, 999, { name: '변경됨' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.NOT_FOUND,
        code: errorCodes.CATEGORY_NOT_FOUND,
      });
    });

    it('타 사용자 카테고리: FORBIDDEN(403) throw', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 2, name: '업무', is_default: false, user_id: 99 });

      await expect(
        categoryService.updateCategory(10, 2, { name: '변경됨' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.FORBIDDEN,
        code: errorCodes.FORBIDDEN,
      });
    });

    it('기본 카테고리: DEFAULT_CATEGORY_NOT_MODIFIABLE(422) throw', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 1, name: '기본', is_default: true, user_id: 10 });

      await expect(
        categoryService.updateCategory(10, 1, { name: '변경됨' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.UNPROCESSABLE_ENTITY,
        code: errorCodes.DEFAULT_CATEGORY_NOT_MODIFIABLE,
      });
    });
  });

  // ──────────────────────────────────────────────
  // deleteCategory
  // ──────────────────────────────────────────────
  describe('deleteCategory', () => {
    it('정상 삭제: 하위 할일 재지정 후 deleteById 호출 확인', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 2, name: '업무', is_default: false, user_id: 10 });
      categoryRepo.findDefaultByUserId.mockResolvedValue({ id: 1, name: '기본', is_default: true, user_id: 10 });
      todoRepo.findByUserIdAndCategory.mockResolvedValue([
        { id: 100, user_id: 10, category_id: 2 },
        { id: 101, user_id: 10, category_id: 2 },
      ]);
      todoRepo.updateCategory.mockResolvedValue({});
      categoryRepo.deleteById.mockResolvedValue();

      await categoryService.deleteCategory(10, 2);

      expect(categoryRepo.findDefaultByUserId).toHaveBeenCalledWith(10);
      expect(todoRepo.findByUserIdAndCategory).toHaveBeenCalledWith(10, 2);
      expect(todoRepo.updateCategory).toHaveBeenCalledWith(100, 1);
      expect(todoRepo.updateCategory).toHaveBeenCalledWith(101, 1);
      expect(categoryRepo.deleteById).toHaveBeenCalledWith(2);
    });

    it('카테고리 없음: CATEGORY_NOT_FOUND(404) throw', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(
        categoryService.deleteCategory(10, 999)
      ).rejects.toMatchObject({
        statusCode: httpStatus.NOT_FOUND,
        code: errorCodes.CATEGORY_NOT_FOUND,
      });
    });

    it('타 사용자 카테고리: FORBIDDEN(403) throw', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 2, name: '업무', is_default: false, user_id: 99 });

      await expect(
        categoryService.deleteCategory(10, 2)
      ).rejects.toMatchObject({
        statusCode: httpStatus.FORBIDDEN,
        code: errorCodes.FORBIDDEN,
      });
    });

    it('기본 카테고리: DEFAULT_CATEGORY_NOT_DELETABLE(422) throw', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 1, name: '기본', is_default: true, user_id: 10 });

      await expect(
        categoryService.deleteCategory(10, 1)
      ).rejects.toMatchObject({
        statusCode: httpStatus.UNPROCESSABLE_ENTITY,
        code: errorCodes.DEFAULT_CATEGORY_NOT_DELETABLE,
      });
    });
  });
});
