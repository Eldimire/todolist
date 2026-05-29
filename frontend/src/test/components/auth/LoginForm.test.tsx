import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginForm } from '../../../components/auth/LoginForm'
import * as useAuthModule from '../../../hooks/useAuth'

vi.mock('../../../hooks/useAuth')

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )
}

describe('LoginForm', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthModule.useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as ReturnType<typeof useAuthModule.useLogin>)
  })

  describe('렌더링', () => {
    it('이메일, 비밀번호 입력 필드와 로그인 버튼을 렌더링한다', () => {
      renderLoginForm()
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
    })

    it('회원가입 링크를 렌더링한다', () => {
      renderLoginForm()
      expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument()
    })
  })

  describe('유효성 검증', () => {
    it('빈 폼 제출 시 이메일과 비밀번호 오류 메시지를 표시한다', () => {
      renderLoginForm()
      fireEvent.click(screen.getByRole('button', { name: '로그인' }))
      expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument()
      expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument()
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('이메일 형식이 잘못된 경우 오류 메시지를 표시한다', () => {
      renderLoginForm()
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'invalid-email' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: '로그인' }))
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeInTheDocument()
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('비밀번호가 8자 미만인 경우 오류 메시지를 표시한다', () => {
      renderLoginForm()
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'short' } })
      fireEvent.click(screen.getByRole('button', { name: '로그인' }))
      expect(screen.getByText('비밀번호는 8자 이상이어야 합니다.')).toBeInTheDocument()
      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('폼 제출', () => {
    it('유효한 입력으로 제출 시 mutate를 올바른 데이터로 호출한다', () => {
      renderLoginForm()
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: '로그인' }))
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'test@test.com', password: 'password123' },
        expect.objectContaining({ onError: expect.any(Function) })
      )
    })
  })

  describe('API 에러 처리', () => {
    it('INVALID_CREDENTIALS 에러 시 폼 레벨 에러 메시지를 표시한다', () => {
      vi.mocked(useAuthModule.useLogin).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) => {
          callbacks?.onError?.({
            response: { data: { code: 'INVALID_CREDENTIALS', message: '...' } },
          })
        }),
        isPending: false,
      } as ReturnType<typeof useAuthModule.useLogin>)

      renderLoginForm()
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: '로그인' }))
      expect(
        screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')
      ).toBeInTheDocument()
    })

    it('서버 오류 시 기본 에러 메시지를 표시한다', () => {
      vi.mocked(useAuthModule.useLogin).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) => {
          callbacks?.onError?.({
            response: { data: { code: 'INTERNAL_SERVER_ERROR', message: '...' } },
          })
        }),
        isPending: false,
      } as ReturnType<typeof useAuthModule.useLogin>)

      renderLoginForm()
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: '로그인' }))
      expect(
        screen.getByText('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      ).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('isPending이 true일 때 버튼을 비활성화하고 텍스트를 변경한다', () => {
      vi.mocked(useAuthModule.useLogin).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      } as ReturnType<typeof useAuthModule.useLogin>)

      renderLoginForm()
      const button = screen.getByRole('button', { name: '로그인 중...' })
      expect(button).toBeDisabled()
    })
  })
})
