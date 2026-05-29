import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SignupForm } from '../../../components/auth/SignupForm'
import * as useAuthModule from '../../../hooks/useAuth'

vi.mock('../../../hooks/useAuth')

function renderSignupForm() {
  return render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>
  )
}

describe('SignupForm', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthModule.useSignup).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useAuthModule.useSignup>)
  })

  describe('렌더링', () => {
    it('이름, 이메일, 비밀번호, 비밀번호 확인 필드와 가입 버튼을 렌더링한다', () => {
      renderSignupForm()
      expect(screen.getByLabelText('이름')).toBeInTheDocument()
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument()
    })

    it('로그인 링크를 렌더링한다', () => {
      renderSignupForm()
      expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument()
    })
  })

  describe('유효성 검증', () => {
    it('빈 폼 제출 시 모든 필드에 오류 메시지를 표시한다', () => {
      renderSignupForm()
      fireEvent.click(screen.getByRole('button', { name: '가입하기' }))
      expect(screen.getByText('이름을 입력해주세요.')).toBeInTheDocument()
      expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument()
      expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument()
      expect(screen.getByText('비밀번호 확인을 입력해주세요.')).toBeInTheDocument()
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('이메일 형식이 잘못된 경우 오류 메시지를 표시한다', () => {
      renderSignupForm()
      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'not-an-email' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: '가입하기' }))
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeInTheDocument()
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('비밀번호가 8자 미만인 경우 오류 메시지를 표시한다', () => {
      renderSignupForm()
      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: '1234567' } })
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: '1234567' } })
      fireEvent.click(screen.getByRole('button', { name: '가입하기' }))
      expect(screen.getByText('비밀번호는 8자 이상이어야 합니다.')).toBeInTheDocument()
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('비밀번호와 확인 비밀번호가 다를 경우 오류 메시지를 표시한다', () => {
      renderSignupForm()
      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'different123' } })
      fireEvent.click(screen.getByRole('button', { name: '가입하기' }))
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('폼 제출', () => {
    it('유효한 입력으로 제출 시 mutate를 올바른 데이터로 호출한다', () => {
      renderSignupForm()
      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: '가입하기' }))
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'test@test.com', password: 'password123', name: '홍길동' },
        expect.objectContaining({ onError: expect.any(Function) })
      )
    })
  })

  describe('API 에러 처리', () => {
    it('EMAIL_ALREADY_EXISTS 에러 시 폼 레벨 에러 메시지를 표시한다', () => {
      vi.mocked(useAuthModule.useSignup).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) => {
          callbacks?.onError?.({
            response: { data: { code: 'EMAIL_ALREADY_EXISTS', message: '...' } },
          })
        }),
        isPending: false,
      } as unknown as ReturnType<typeof useAuthModule.useSignup>)

      renderSignupForm()
      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'dup@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: '가입하기' }))
      expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument()
    })

    it('VALIDATION_ERROR 에러 시 폼 레벨 에러 메시지를 표시한다', () => {
      vi.mocked(useAuthModule.useSignup).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) => {
          callbacks?.onError?.({
            response: { data: { code: 'VALIDATION_ERROR', message: '...' } },
          })
        }),
        isPending: false,
      } as unknown as ReturnType<typeof useAuthModule.useSignup>)

      renderSignupForm()
      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: '가입하기' }))
      expect(screen.getByText('입력값을 확인해주세요.')).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('isPending이 true일 때 버튼을 비활성화하고 텍스트를 변경한다', () => {
      vi.mocked(useAuthModule.useSignup).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      } as unknown as ReturnType<typeof useAuthModule.useSignup>)

      renderSignupForm()
      const button = screen.getByRole('button', { name: '가입 중...' })
      expect(button).toBeDisabled()
    })
  })
})
