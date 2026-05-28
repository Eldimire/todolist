'use strict';

const todoRepo = require('../repository/todo.repository');
const categoryRepo = require('../repository/category.repository');
const AppError = require('../utils/AppError');
const errorCodes = require('../utils/errorCodes');
const httpStatus = require('../constants/httpStatus');

function validateDateRange(startDate, endDate) {
  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, errorCodes.INVALID_DATE_RANGE, '종료일은 시작일보다 이전일 수 없습니다.');
  }
}

async function getTodos(userId, { categoryId, status } = {}) {
  if (categoryId) return todoRepo.findByUserIdAndCategory(userId, categoryId);
  if (status) return todoRepo.findByUserIdAndStatus(userId, status);
  return todoRepo.findByUserId(userId);
}

async function createTodo(userId, { title, description, categoryId, startDate, endDate }) {
  // BR-05: 날짜 유효성 검증
  validateDateRange(startDate, endDate);
  // BR-03: categoryId 미지정 시 기본 카테고리 자동 적용
  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId) {
    const defaultCategory = await categoryRepo.findDefaultByUserId(userId);
    resolvedCategoryId = defaultCategory.id;
  }
  return todoRepo.create({ userId, categoryId: resolvedCategoryId, title, description, startDate, endDate });
}

async function updateTodo(userId, todoId, fields) {
  const todo = await todoRepo.findById(todoId);
  if (!todo) {
    throw new AppError(httpStatus.NOT_FOUND, errorCodes.TODO_NOT_FOUND, '할일을 찾을 수 없습니다.');
  }
  // BR-02: 소유권 확인
  if (todo.user_id !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, errorCodes.FORBIDDEN, '접근 권한이 없습니다.');
  }
  // BR-05: 날짜 유효성 검증
  const startDate = fields.startDate ?? todo.start_date;
  const endDate = fields.endDate ?? todo.end_date;
  validateDateRange(startDate, endDate);
  return todoRepo.update(todoId, fields);
}

async function deleteTodo(userId, todoId) {
  const todo = await todoRepo.findById(todoId);
  if (!todo) {
    throw new AppError(httpStatus.NOT_FOUND, errorCodes.TODO_NOT_FOUND, '할일을 찾을 수 없습니다.');
  }
  // BR-02: 소유권 확인
  if (todo.user_id !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, errorCodes.FORBIDDEN, '접근 권한이 없습니다.');
  }
  await todoRepo.deleteById(todoId);
}

async function toggleComplete(userId, todoId) {
  const todo = await todoRepo.findById(todoId);
  if (!todo) {
    throw new AppError(httpStatus.NOT_FOUND, errorCodes.TODO_NOT_FOUND, '할일을 찾을 수 없습니다.');
  }
  // BR-02: 소유권 확인
  if (todo.user_id !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, errorCodes.FORBIDDEN, '접근 권한이 없습니다.');
  }
  return todoRepo.update(todoId, { isCompleted: !todo.is_completed });
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo, toggleComplete };
