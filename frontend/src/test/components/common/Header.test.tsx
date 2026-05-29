import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '../../../components/common/Header'
import { useAuthStore } from '../../../stores/authStore'

vi.mock('../../../hooks/useAuth', () => ({
  useLogout: () => ({ mutate: mockLogoutMutate, isPending: false }),
}))

const mockLogoutMutate = vi.fn()

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: '홍길동',
  language: 'ko' as const,
  themeMode: 'light' as const,
}

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, token: null })
  })

  describe('렌더링', () => {
    it('"TodoList" 앱 타이틀을 렌더링한다', () => {
      renderHeader()
      expect(screen.getByText('TodoList')).toBeInTheDocument()
    })

    it('"내 정보 수정" 링크를 렌더링한다', () => {
      renderHeader()
      expect(screen.getByRole('link', { name: '내 정보 수정' })).toBeInTheDocument()
    })

    it('"로그아웃" 버튼을 렌더링한다', () => {
      renderHeader()
      expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
    })

    it('user가 있으면 "안녕하세요, {name}님" 텍스트를 렌더링한다', () => {
      useAuthStore.setState({ user: mockUser, token: 'token' })
      renderHeader()
      expect(screen.getByText('안녕하세요, 홍길동님')).toBeInTheDocument()
    })

    it('user가 없으면 인사 텍스트를 렌더링하지 않는다', () => {
      renderHeader()
      expect(screen.queryByText(/안녕하세요/)).not.toBeInTheDocument()
    })
  })

  describe('로그아웃', () => {
    it('로그아웃 버튼 클릭 시 logout mutate를 호출한다', () => {
      renderHeader()
      fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
      expect(mockLogoutMutate).toHaveBeenCalledTimes(1)
    })
  })

  describe('링크', () => {
    it('"TodoList" 링크가 "/" 경로를 가진다', () => {
      renderHeader()
      expect(screen.getByRole('link', { name: 'TodoList' })).toHaveAttribute('href', '/')
    })

    it('"내 정보 수정" 링크가 "/profile" 경로를 가진다', () => {
      renderHeader()
      expect(screen.getByRole('link', { name: '내 정보 수정' })).toHaveAttribute('href', '/profile')
    })
  })
})
