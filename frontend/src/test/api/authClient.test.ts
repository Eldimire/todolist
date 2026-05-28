import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signup, login, logout, updateProfile, updateLanguage, updateTheme } from '../../api/authClient'

const mockPost = vi.fn()
const mockPatch = vi.fn()

vi.mock('../../api/client', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}))

describe('authClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signup', () => {
    it('POST /auth/signup을 호출한다', async () => {
      const userData = { id: '1', email: 'test@test.com', name: '홍길동' }
      mockPost.mockResolvedValue({ data: { user: userData } })
      const result = await signup({ email: 'test@test.com', password: 'password1', name: '홍길동' })
      expect(mockPost).toHaveBeenCalledWith('/auth/signup', {
        email: 'test@test.com',
        password: 'password1',
        name: '홍길동',
      })
      expect(result.user).toEqual(userData)
    })
  })

  describe('login', () => {
    it('POST /auth/login을 호출하고 token과 user를 반환한다', async () => {
      const loginData = {
        token: 'jwt-token',
        user: { id: '1', email: 'test@test.com', name: '홍길동', language: 'ko', themeMode: 'light' },
      }
      mockPost.mockResolvedValue({ data: loginData })
      const result = await login({ email: 'test@test.com', password: 'password1' })
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password1',
      })
      expect(result.token).toBe('jwt-token')
      expect(result.user.email).toBe('test@test.com')
    })
  })

  describe('logout', () => {
    it('POST /auth/logout을 호출한다', async () => {
      mockPost.mockResolvedValue({ data: { message: '로그아웃 되었습니다.' } })
      await logout()
      expect(mockPost).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('updateProfile', () => {
    it('PATCH /users/me를 호출한다', async () => {
      const updatedUser = { id: '1', email: 'test@test.com', name: '김철수' }
      mockPatch.mockResolvedValue({ data: { user: updatedUser } })
      const result = await updateProfile({ name: '김철수' })
      expect(mockPatch).toHaveBeenCalledWith('/users/me', { name: '김철수' })
      expect(result.user.name).toBe('김철수')
    })
  })

  describe('updateLanguage', () => {
    it('PATCH /users/me/language를 호출한다', async () => {
      const updatedUser = { id: '1', email: 'test@test.com', name: '홍길동', language: 'en' }
      mockPatch.mockResolvedValue({ data: { user: updatedUser } })
      const result = await updateLanguage('en')
      expect(mockPatch).toHaveBeenCalledWith('/users/me/language', { language: 'en' })
      expect(result.user.language).toBe('en')
    })
  })

  describe('updateTheme', () => {
    it('PATCH /users/me/theme를 호출한다', async () => {
      const updatedUser = { id: '1', email: 'test@test.com', name: '홍길동', themeMode: 'dark' }
      mockPatch.mockResolvedValue({ data: { user: updatedUser } })
      const result = await updateTheme('dark')
      expect(mockPatch).toHaveBeenCalledWith('/users/me/theme', { themeMode: 'dark' })
      expect(result.user.themeMode).toBe('dark')
    })
  })
})
