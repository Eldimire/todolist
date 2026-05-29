import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '../../pages/LoginPage'

vi.mock('../../hooks/useAuth', () => ({
  useLogin: () => ({ mutate: vi.fn(), isPending: false }),
}))

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('"로그인" 제목을 렌더링한다', () => {
    renderLoginPage()
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
  })

  it('이메일 입력 필드를 렌더링한다', () => {
    renderLoginPage()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
  })

  it('비밀번호 입력 필드를 렌더링한다', () => {
    renderLoginPage()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
  })

  it('로그인 버튼을 렌더링한다', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('회원가입 링크를 렌더링한다', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument()
  })
})
