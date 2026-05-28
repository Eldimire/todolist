'use strict';

const todoService = require('../service/todo.service');
const AppError = require('../utils/AppError');
const errorCodes = require('../utils/errorCodes');
const httpStatus = require('../constants/httpStatus');

async function getTodos(req, res, next) {
  try {
    const userId = req.user.id;
    const { categoryId, status } = req.query;
    const result = await todoService.getTodos(userId, { categoryId, status });
    return res.status(httpStatus.OK).json({ todos: result });
  } catch (err) {
    return next(err);
  }
}

async function createTodo(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, categoryId, startDate, endDate } = req.body;

    if (!title) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '제목을 입력해주세요.');
    }
    if (title.length > 200) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '제목은 200자 이하여야 합니다.');
    }
    if (description && description.length > 2000) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '설명은 2000자 이하여야 합니다.');
    }
    if (!startDate) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '시작일을 입력해주세요.');
    }
    if (!endDate) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '종료일을 입력해주세요.');
    }

    const result = await todoService.createTodo(userId, { title, description, categoryId, startDate, endDate });
    return res.status(httpStatus.CREATED).json({ todo: result });
  } catch (err) {
    return next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;
    const { title, description, categoryId, startDate, endDate, isCompleted } = req.body;

    const hasField =
      title !== undefined ||
      description !== undefined ||
      categoryId !== undefined ||
      startDate !== undefined ||
      endDate !== undefined ||
      isCompleted !== undefined;

    if (!hasField) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '수정할 필드를 입력해주세요.');
    }

    const fields = {};
    if (title !== undefined) fields.title = title;
    if (description !== undefined) fields.description = description;
    if (categoryId !== undefined) fields.categoryId = categoryId;
    if (startDate !== undefined) fields.startDate = startDate;
    if (endDate !== undefined) fields.endDate = endDate;
    if (isCompleted !== undefined) fields.isCompleted = isCompleted;

    const result = await todoService.updateTodo(userId, todoId, fields);
    return res.status(httpStatus.OK).json({ todo: result });
  } catch (err) {
    return next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;
    await todoService.deleteTodo(userId, todoId);
    return res.status(httpStatus.OK).json({ message: '할일이 삭제되었습니다.' });
  } catch (err) {
    return next(err);
  }
}

async function toggleComplete(req, res, next) {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;
    const result = await todoService.toggleComplete(userId, todoId);
    return res.status(httpStatus.OK).json({ todo: result });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo, toggleComplete };
