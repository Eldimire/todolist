'use strict';

const authService = require('../service/auth.service');
const AppError = require('../utils/AppError');
const errorCodes = require('../utils/errorCodes');
const httpStatus = require('../constants/httpStatus');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function signup(req, res, next) {
  try {
    const { email, name, password } = req.body;

    if (!email || !isValidEmail(email)) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '유효한 이메일을 입력해주세요.');
    }
    if (!password || password.length < 8) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '비밀번호는 8자 이상이어야 합니다.');
    }
    if (!name) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '이름을 입력해주세요.');
    }

    const result = await authService.signup({ email, password, name });
    return res.status(httpStatus.CREATED).json({ user: result });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '유효한 이메일을 입력해주세요.');
    }
    if (!password) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '비밀번호를 입력해주세요.');
    }

    const result = await authService.login({ email, password });
    return res.status(httpStatus.OK).json({ token: result.token, user: result.user });
  } catch (err) {
    return next(err);
  }
}

function logout(_req, res) {
  return res.status(httpStatus.OK).json({ message: '로그아웃 되었습니다.' });
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, password } = req.body;

    if (password !== undefined && password.length < 8) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '비밀번호는 8자 이상이어야 합니다.');
    }

    const result = await authService.updateProfile(userId, { name, password });
    return res.status(httpStatus.OK).json({ user: result });
  } catch (err) {
    return next(err);
  }
}

async function updateLanguage(req, res, next) {
  try {
    const userId = req.user.id;
    const { language } = req.body;
    const VALID_LANGUAGES = ['ko', 'en', 'ja'];
    if (!language || !VALID_LANGUAGES.includes(language)) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '유효한 언어 코드(ko/en/ja)를 입력해주세요.');
    }
    const result = await authService.updateLanguage(userId, language);
    return res.status(httpStatus.OK).json({ user: result });
  } catch (err) {
    return next(err);
  }
}

async function updateTheme(req, res, next) {
  try {
    const userId = req.user.id;
    const { themeMode } = req.body;
    const VALID_THEMES = ['light', 'dark'];
    if (!themeMode || !VALID_THEMES.includes(themeMode)) {
      throw new AppError(httpStatus.BAD_REQUEST, errorCodes.VALIDATION_ERROR, '유효한 테마(light/dark)를 입력해주세요.');
    }
    const result = await authService.updateTheme(userId, themeMode);
    return res.status(httpStatus.OK).json({ user: result });
  } catch (err) {
    return next(err);
  }
}

module.exports = { signup, login, logout, updateProfile, updateLanguage, updateTheme };
