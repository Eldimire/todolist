import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { useAuthStore } from '../stores/authStore'

vi.mock('../pages/LoginPage', () => ({
  LoginPage: () => <div data-testid="login-page">로그인 페이지</div>,
}))
vi.mock('../pages/SignupPage', () => ({
  SignupPage: () => <div data-testid="signup-page">회원가입 페이지</div>,
}))
vi.mock('../pages/TodoListPage', () => ({
  TodoListPage: () => <div data-testid="todo-list-page">할일 목록</div>,
}))
vi.mock('../pages/TodoFormPage', () => ({
  TodoFormPage: () => <div data-testid="todo-form-page">할일 폼</div>,
}))
vi.mock('../pages/ProfilePage', () => ({
  ProfilePage: () => <div data-testid="profile-page">프로필 페이지</div>,
}))
vi.mock('../pages/NotFoundPage', () => ({
  NotFoundPage: () => <div data-testid="not-found-page">페이지를 찾을 수 없습니다</div>,
}))

describe('App', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null })
  })

  it('미인증 상태에서 루트 경로 접근 시 로그인 페이지를 렌더링한다', () => {
    render(<App />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('인증 상태에서 루트 경로 접근 시 할일 목록 페이지를 렌더링한다', () => {
    useAuthStore.setState({ token: 'test-token', user: null })
    render(<App />)
    expect(screen.getByTestId('todo-list-page')).toBeInTheDocument()
  })
})
