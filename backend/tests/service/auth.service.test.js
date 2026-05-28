'use strict';

jest.mock('../../src/repository/user.repository');
jest.mock('../../src/repository/category.repository');
jest.mock('../../src/utils/hash');
jest.mock('../../src/utils/jwt');

const userRepo = require('../../src/repository/user.repository');
const categoryRepo = require('../../src/repository/category.repository');
const { hashPassword, comparePassword } = require('../../src/utils/hash');
const { generateToken } = require('../../src/utils/jwt');
const authService = require('../../src/service/auth.service');
const AppError = require('../../src/utils/AppError');
const errorCodes = require('../../src/utils/errorCodes');
const httpStatus = require('../../src/constants/httpStatus');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // signup
  // ──────────────────────────────────────────────
  describe('signup', () => {
    it('정상 가입: userRepo.create, categoryRepo.create 호출 후 사용자 정보 반환', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashed_password');
      userRepo.create.mockResolvedValue({ id: 1, email: 'test@example.com', name: '홍길동' });
      categoryRepo.create.mockResolvedValue({ id: 10, name: '기본', is_default: true });

      const result = await authService.signup({ email: 'test@example.com', password: 'pass123', name: '홍길동' });

      expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(hashPassword).toHaveBeenCalledWith('pass123');
      expect(userRepo.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashed_password',
        name: '홍길동',
      });
      expect(categoryRepo.create).toHaveBeenCalledWith({ userId: 1, name: '기본', isDefault: true });
      expect(result).toEqual({ id: 1, email: 'test@example.com', name: '홍길동' });
    });

    it('이메일 중복: EMAIL_ALREADY_EXISTS(409) AppError throw', async () => {
      userRepo.findByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(
        authService.signup({ email: 'test@example.com', password: 'pass123', name: '홍길동' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.CONFLICT,
        code: errorCodes.EMAIL_ALREADY_EXISTS,
      });
    });
  });

  // ──────────────────────────────────────────────
  // login
  // ──────────────────────────────────────────────
  describe('login', () => {
    it('정상 로그인: token + user(language, themeMode 포함) 반환', async () => {
      userRepo.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: '홍길동',
        password: 'hashed_password',
        language: 'ko',
        theme_mode: 'light',
      });
      comparePassword.mockResolvedValue(true);
      generateToken.mockReturnValue('mock_token');

      const result = await authService.login({ email: 'test@example.com', password: 'pass123' });

      expect(comparePassword).toHaveBeenCalledWith('pass123', 'hashed_password');
      expect(generateToken).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' });
      expect(result).toEqual({
        token: 'mock_token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: '홍길동',
          language: 'ko',
          themeMode: 'light',
        },
      });
    });

    it('이메일 없음: INVALID_CREDENTIALS(401) AppError throw', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'none@example.com', password: 'pass123' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.UNAUTHORIZED,
        code: errorCodes.INVALID_CREDENTIALS,
      });
    });

    it('비밀번호 불일치: INVALID_CREDENTIALS(401) AppError throw', async () => {
      userRepo.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
      });
      comparePassword.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toMatchObject({
        statusCode: httpStatus.UNAUTHORIZED,
        code: errorCodes.INVALID_CREDENTIALS,
      });
    });
  });

  // ──────────────────────────────────────────────
  // updateProfile
  // ──────────────────────────────────────────────
  describe('updateProfile', () => {
    it('name만 변경: userRepo.update 호출 확인', async () => {
      userRepo.update.mockResolvedValue({ id: 1, email: 'test@example.com', name: '새이름' });

      const result = await authService.updateProfile(1, { name: '새이름' });

      expect(userRepo.update).toHaveBeenCalledWith(1, { name: '새이름' });
      expect(result).toEqual({ id: 1, email: 'test@example.com', name: '새이름' });
    });

    it('password 변경: hashPassword 호출 후 update 확인', async () => {
      hashPassword.mockResolvedValue('new_hashed_password');
      userRepo.update.mockResolvedValue({ id: 1, email: 'test@example.com', name: '홍길동' });

      await authService.updateProfile(1, { password: 'newpass' });

      expect(hashPassword).toHaveBeenCalledWith('newpass');
      expect(userRepo.update).toHaveBeenCalledWith(1, { password: 'new_hashed_password' });
    });
  });

  // ──────────────────────────────────────────────
  // updateLanguage
  // ──────────────────────────────────────────────
  describe('updateLanguage', () => {
    it('userRepo.update(userId, { language }) 를 호출한다', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: '홍길동', language: 'en', themeMode: 'light' };
      userRepo.update.mockResolvedValue(mockUser);

      await authService.updateLanguage(1, 'en');

      expect(userRepo.update).toHaveBeenCalledWith(1, { language: 'en' });
    });

    it('업데이트된 user를 반환한다', async () => {
      userRepo.update.mockResolvedValue({ id: 1, email: 'test@example.com', name: '홍길동', language: 'ja', theme_mode: 'light' });

      const result = await authService.updateLanguage(1, 'ja');

      expect(result).toEqual({ id: 1, email: 'test@example.com', name: '홍길동', language: 'ja', themeMode: 'light' });
    });
  });

  // ──────────────────────────────────────────────
  // updateTheme
  // ──────────────────────────────────────────────
  describe('updateTheme', () => {
    it('userRepo.update(userId, { themeMode }) 를 호출한다', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: '홍길동', language: 'ko', themeMode: 'dark' };
      userRepo.update.mockResolvedValue(mockUser);

      await authService.updateTheme(1, 'dark');

      expect(userRepo.update).toHaveBeenCalledWith(1, { themeMode: 'dark' });
    });

    it('업데이트된 user를 반환한다', async () => {
      userRepo.update.mockResolvedValue({ id: 1, email: 'test@example.com', name: '홍길동', language: 'ko', theme_mode: 'dark' });

      const result = await authService.updateTheme(1, 'dark');

      expect(result).toEqual({ id: 1, email: 'test@example.com', name: '홍길동', language: 'ko', themeMode: 'dark' });
    });
  });
});
