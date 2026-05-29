import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { TOKEN_KEY } from '../../api/client'

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: '홍길동',
  language: 'ko' as const,
  themeMode: 'light' as const,
}

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ user: null, token: null })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('초기 상태', () => {
    it('user와 token이 null이다', () => {
      const { user, token } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(token).toBeNull()
    })
  })

  describe('setAuth', () => {
    it('user와 token 상태를 설정한다', () => {
      const { setAuth } = useAuthStore.getState()
      setAuth(mockUser, 'jwt-token-123')
      const { user, token } = useAuthStore.getState()
      expect(user).toEqual(mockUser)
      expect(token).toBe('jwt-token-123')
    })

    it('토큰을 localStorage에 저장한다', () => {
      const { setAuth } = useAuthStore.getState()
      setAuth(mockUser, 'jwt-token-123')
      expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-token-123')
    })

    it('user 정보가 정확히 저장된다', () => {
      const { setAuth } = useAuthStore.getState()
      setAuth(mockUser, 'jwt-token-123')
      const { user } = useAuthStore.getState()
      expect(user?.email).toBe('test@test.com')
      expect(user?.name).toBe('홍길동')
      expect(user?.language).toBe('ko')
      expect(user?.themeMode).toBe('light')
    })
  })

  describe('clearAuth', () => {
    it('user와 token을 null로 초기화한다', () => {
      const { setAuth, clearAuth } = useAuthStore.getState()
      setAuth(mockUser, 'jwt-token-123')
      clearAuth()
      const { user, token } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(token).toBeNull()
    })

    it('localStorage에서 토큰을 제거한다', () => {
      const { setAuth, clearAuth } = useAuthStore.getState()
      setAuth(mockUser, 'jwt-token-123')
      expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-token-123')
      clearAuth()
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    })
  })

  describe('localStorage 토큰 복원', () => {
    it('앱 시작 시 localStorage의 토큰을 token 상태로 복원한다', async () => {
      localStorage.setItem(TOKEN_KEY, 'saved-token')
      const { vi } = await import('vitest')
      vi.resetModules()
      const { useAuthStore: freshStore } = await import('../../stores/authStore')
      expect(freshStore.getState().token).toBe('saved-token')
      vi.resetModules()
    })
  })
})
