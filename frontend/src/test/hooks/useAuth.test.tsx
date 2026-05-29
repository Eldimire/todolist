import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useLogin, useSignup, useLogout } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'
import { login, signup, logout } from '../../api/authClient'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../api/authClient')

const mockLogin = vi.mocked(login)
const mockSignup = vi.mocked(signup)
const mockLogout = vi.mocked(logout)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: '홍길동',
  language: 'ko' as const,
  themeMode: 'light' as const,
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useAuthStore.setState({ user: null, token: null })
  })

  it('로그인 성공 시 setAuth를 호출하고 /로 이동한다', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'mock-token', user: mockUser })

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'test@test.com', password: 'password123' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(useAuthStore.getState().token).toBe('mock-token')
    expect(useAuthStore.getState().user).toEqual(mockUser)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('로그인 실패 시 에러 상태가 되고 navigate를 호출하지 않는다', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { code: 'INVALID_CREDENTIALS', message: '...' } },
    })

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'test@test.com', password: 'wrong' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(useAuthStore.getState().token).toBeNull()
  })
})

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('회원가입 성공 시 /login으로 이동한다', async () => {
    mockSignup.mockResolvedValueOnce({ user: { id: '1', email: 'test@test.com', name: '홍길동' } })

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'test@test.com', password: 'password123', name: '홍길동' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('이메일 중복(EMAIL_ALREADY_EXISTS) 시 에러 상태가 되고 navigate를 호출하지 않는다', async () => {
    mockSignup.mockRejectedValueOnce({
      response: { data: { code: 'EMAIL_ALREADY_EXISTS', message: '...' } },
    })

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'dup@test.com', password: 'password123', name: '홍길동' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'mock-token')
    useAuthStore.setState({ user: mockUser, token: 'mock-token' })
  })

  it('로그아웃 성공 시 clearAuth를 호출하고 /login으로 이동한다', async () => {
    mockLogout.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('로그아웃 실패해도 clearAuth를 호출하고 /login으로 이동한다', async () => {
    mockLogout.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
