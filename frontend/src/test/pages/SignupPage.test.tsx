import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SignupPage } from '../../pages/SignupPage'

vi.mock('../../hooks/useAuth', () => ({
  useSignup: () => ({ mutate: vi.fn(), isPending: false }),
}))

function renderSignupPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  )
}

describe('SignupPage', () => {
  it('"회원가입" 제목을 렌더링한다', () => {
    renderSignupPage()
    expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument()
  })

  it('이름 입력 필드를 렌더링한다', () => {
    renderSignupPage()
    expect(screen.getByLabelText('이름')).toBeInTheDocument()
  })

  it('이메일 입력 필드를 렌더링한다', () => {
    renderSignupPage()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
  })

  it('비밀번호 입력 필드를 렌더링한다', () => {
    renderSignupPage()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
  })

  it('비밀번호 확인 입력 필드를 렌더링한다', () => {
    renderSignupPage()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
  })

  it('가입하기 버튼을 렌더링한다', () => {
    renderSignupPage()
    expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument()
  })

  it('로그인 링크를 렌더링한다', () => {
    renderSignupPage()
    expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument()
  })
})
