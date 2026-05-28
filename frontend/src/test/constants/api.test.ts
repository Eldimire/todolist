import { describe, it, expect } from 'vitest'
import { ENDPOINTS } from '../../constants/api'

describe('constants/api', () => {
  describe('ENDPOINTS', () => {
    it('인증 엔드포인트가 정의되어 있다', () => {
      expect(ENDPOINTS.AUTH.SIGNUP).toBe('/auth/signup')
      expect(ENDPOINTS.AUTH.LOGIN).toBe('/auth/login')
      expect(ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout')
    })

    it('사용자 엔드포인트가 정의되어 있다', () => {
      expect(ENDPOINTS.USERS.ME).toBe('/users/me')
      expect(ENDPOINTS.USERS.LANGUAGE).toBe('/users/me/language')
      expect(ENDPOINTS.USERS.THEME).toBe('/users/me/theme')
    })

    it('카테고리 엔드포인트가 정의되어 있다', () => {
      expect(ENDPOINTS.CATEGORIES.BASE).toBe('/categories')
      expect(ENDPOINTS.CATEGORIES.BY_ID('abc-123')).toBe('/categories/abc-123')
    })

    it('할일 엔드포인트가 정의되어 있다', () => {
      expect(ENDPOINTS.TODOS.BASE).toBe('/todos')
      expect(ENDPOINTS.TODOS.BY_ID('abc-123')).toBe('/todos/abc-123')
      expect(ENDPOINTS.TODOS.COMPLETE('abc-123')).toBe('/todos/abc-123/complete')
    })
  })
})
