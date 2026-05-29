import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfilePage } from '../../pages/ProfilePage'
import { useAuthStore } from '../../stores/authStore'
import * as useAuthModule from '../../hooks/useAuth'

vi.mock('../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}))

vi.mock('../../components/category/CategoryList', () => ({
  CategoryList: () => <div data-testid="category-list">카테고리 목록</div>,
}))

vi.mock('../../hooks/useAuth')

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUser = { id: 'u1', email: 'test@example.com', name: '홍길동' }
const mockUpdate = { mutate: vi.fn(), isPending: false }
const mockLogout = { mutate: vi.fn(), isPending: false }

function setupMocks() {
  vi.mocked(useAuthModule.useUpdateProfile).mockReturnValue(
    mockUpdate as ReturnType<typeof useAuthModule.useUpdateProfile>
  )
  vi.mocked(useAuthModule.useLogout).mockReturnValue(
    mockLogout as ReturnType<typeof useAuthModule.useLogout>
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: mockUser, token: 'tok-1' })
    setupMocks()
  })

  describe('렌더링', () => {
    it('"내 정보 수정" 제목을 표시한다', () => {
      render(<ProfilePage />)
      expect(screen.getByText('내 정보 수정')).toBeInTheDocument()
    })

    it('현재 이메일을 표시한다', () => {
      render(<ProfilePage />)
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('이름 필드에 현재 이름이 채워진다', () => {
      render(<ProfilePage />)
      const nameInput = screen.getByLabelText('이름') as HTMLInputElement
      expect(nameInput.value).toBe('홍길동')
    })

    it('새 비밀번호, 새 비밀번호 확인 필드를 표시한다', () => {
      render(<ProfilePage />)
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
      expect(screen.getByLabelText('새 비밀번호 확인')).toBeInTheDocument()
    })

    it('저장하기, 취소, 로그아웃 버튼을 표시한다', () => {
      render(<ProfilePage />)
      expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
    })

    it('CategoryList 컴포넌트를 표시한다', () => {
      render(<ProfilePage />)
      expect(screen.getByTestId('category-list')).toBeInTheDocument()
    })
  })

  describe('유효성 검증', () => {
    it('이름 비어있으면 에러 메시지를 표시한다', () => {
      render(<ProfilePage />)
      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByText('이름은 필수 입력 항목입니다.')).toBeInTheDocument()
    })

    it('비밀번호 8자 미만 → 에러 메시지를 표시한다', () => {
      render(<ProfilePage />)
      fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'short' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByText('비밀번호는 8자 이상이어야 합니다.')).toBeInTheDocument()
    })

    it('비밀번호 확인 불일치 → 에러 메시지를 표시한다', () => {
      render(<ProfilePage />)
      fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), { target: { value: 'different123' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
    })

    it('유효한 폼 제출 시 mutate를 호출하지 않는다 (이름만 변경)', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(mockUpdate.mutate).toHaveBeenCalledWith(
        { name: '홍길동' },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      )
    })
  })

  describe('프로필 수정', () => {
    it('이름 변경 시 name만 전달한다', () => {
      render(<ProfilePage />)
      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '김철수' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(mockUpdate.mutate).toHaveBeenCalledWith(
        { name: '김철수' },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })

    it('비밀번호도 변경 시 name과 password를 전달한다', () => {
      render(<ProfilePage />)
      fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'newpass123' } })
      fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), { target: { value: 'newpass123' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(mockUpdate.mutate).toHaveBeenCalledWith(
        { name: '홍길동', password: 'newpass123' },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })

    it('성공 후 navigate("/")를 호출한다', () => {
      vi.mocked(useAuthModule.useUpdateProfile).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) => callbacks?.onSuccess?.()),
        isPending: false,
      } as ReturnType<typeof useAuthModule.useUpdateProfile>)

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('서버 에러 시 에러 메시지를 표시한다', () => {
      vi.mocked(useAuthModule.useUpdateProfile).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) =>
          callbacks?.onError?.({
            response: { data: { code: 'VALIDATION_ERROR', message: '...' } },
          })
        ),
        isPending: false,
      } as ReturnType<typeof useAuthModule.useUpdateProfile>)

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByRole('alert')).toHaveTextContent('입력값을 확인해주세요.')
    })
  })

  describe('취소 및 로그아웃', () => {
    it('취소 버튼 클릭 시 navigate("/")를 호출한다', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '취소' }))
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('로그아웃 버튼 클릭 시 logoutMutation.mutate를 호출한다', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
      expect(mockLogout.mutate).toHaveBeenCalled()
    })
  })
})
