'use strict';

const userRepo = require('../repository/user.repository');
const categoryRepo = require('../repository/category.repository');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const errorCodes = require('../utils/errorCodes');
const httpStatus = require('../constants/httpStatus');

async function signup({ email, password, name }) {
  // 1. 이메일 중복 확인
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new AppError(httpStatus.CONFLICT, errorCodes.EMAIL_ALREADY_EXISTS, '이미 사용 중인 이메일입니다.');
  }
  // 2. 비밀번호 해싱
  const hashedPassword = await hashPassword(password);
  // 3. 사용자 생성
  const user = await userRepo.create({ email, password: hashedPassword, name });
  // 4. 기본 카테고리 자동 생성 (BR-04)
  await categoryRepo.create({ userId: user.id, name: '기본', isDefault: true });
  return { id: user.id, email: user.email, name: user.name };
}

async function login({ email, password }) {
  // 1. 이메일로 사용자 조회
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, errorCodes.INVALID_CREDENTIALS, '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  // 2. 비밀번호 비교
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, errorCodes.INVALID_CREDENTIALS, '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  // 3. JWT 발급
  const token = generateToken({ id: user.id, email: user.email });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      language: user.language,
      themeMode: user.theme_mode,
    },
  };
}

async function updateProfile(userId, { name, password }) {
  const fields = {};
  if (name !== undefined) fields.name = name;
  if (password !== undefined) fields.password = await hashPassword(password);
  const updated = await userRepo.update(userId, fields);
  return { id: updated.id, email: updated.email, name: updated.name };
}

async function updateLanguage(userId, language) {
  const updated = await userRepo.update(userId, { language });
  return { id: updated.id, email: updated.email, name: updated.name, language: updated.language, themeMode: updated.theme_mode };
}

async function updateTheme(userId, themeMode) {
  const updated = await userRepo.update(userId, { themeMode });
  return { id: updated.id, email: updated.email, name: updated.name, language: updated.language, themeMode: updated.theme_mode };
}

module.exports = { signup, login, updateProfile, updateLanguage, updateTheme };
