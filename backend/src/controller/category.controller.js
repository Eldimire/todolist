'use strict';

const categoryService = require('../service/category.service');
const AppError = require('../utils/AppError');
const errorCodes = require('../utils/errorCodes');
const httpStatus = require('../constants/httpStatus');

async function getCategories(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await categoryService.getCategories(userId);
    return res.status(httpStatus.OK).json({ categories: result });
  } catch (err) {
    return next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '카테고리 이름을 입력해주세요.');
    }
    if (name.length > 100) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '카테고리 이름은 100자 이하여야 합니다.');
    }

    const result = await categoryService.createCategory(userId, { name });
    return res.status(httpStatus.CREATED).json({ category: result });
  } catch (err) {
    return next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;
    const { name } = req.body;

    if (!name) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '카테고리 이름을 입력해주세요.');
    }
    if (name.length > 100) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '카테고리 이름은 100자 이하여야 합니다.');
    }

    const result = await categoryService.updateCategory(userId, categoryId, { name });
    return res.status(httpStatus.OK).json({ category: result });
  } catch (err) {
    return next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    await categoryService.deleteCategory(userId, categoryId);
    return res.status(httpStatus.OK).json({ message: '카테고리가 삭제되었습니다.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
