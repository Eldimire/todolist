'use strict';

const categoryRepo = require('../repository/category.repository');
const todoRepo = require('../repository/todo.repository');
const AppError = require('../utils/AppError');
const errorCodes = require('../utils/errorCodes');
const httpStatus = require('../constants/httpStatus');

async function getCategories(userId) {
  return categoryRepo.findByUserId(userId);
}

async function createCategory(userId, { name }) {
  return categoryRepo.create({ userId, name, isDefault: false });
}

async function updateCategory(userId, categoryId, { name }) {
  const category = await categoryRepo.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, errorCodes.CATEGORY_NOT_FOUND, '카테고리를 찾을 수 없습니다.');
  }
  // BR-02: 소유권 확인
  if (category.user_id !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, errorCodes.FORBIDDEN, '접근 권한이 없습니다.');
  }
  // BR-04: 기본 카테고리 수정 불가
  if (category.is_default) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, errorCodes.DEFAULT_CATEGORY_NOT_MODIFIABLE, '기본 카테고리는 수정할 수 없습니다.');
  }
  return categoryRepo.update(categoryId, { name });
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepo.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, errorCodes.CATEGORY_NOT_FOUND, '카테고리를 찾을 수 없습니다.');
  }
  // BR-02: 소유권 확인
  if (category.user_id !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, errorCodes.FORBIDDEN, '접근 권한이 없습니다.');
  }
  // BR-04: 기본 카테고리 삭제 불가
  if (category.is_default) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, errorCodes.DEFAULT_CATEGORY_NOT_DELETABLE, '기본 카테고리는 삭제할 수 없습니다.');
  }
  // 하위 할일을 기본 카테고리로 재지정
  const defaultCategory = await categoryRepo.findDefaultByUserId(userId);
  const todos = await todoRepo.findByUserIdAndCategory(userId, categoryId);
  await Promise.all(todos.map((todo) => todoRepo.updateCategory(todo.id, defaultCategory.id)));
  await categoryRepo.deleteById(categoryId);
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
