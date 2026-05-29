import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useAuthStore } from '../../../stores/authStore'

function renderWithRoute(authenticated: boolean) {
  useAuthStore.setState({ token: authenticated ? 'test-token' : null, user: null })
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>보호된 콘텐츠</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>로그인 페이지</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null })
  })

  describe('미인증 상태', () => {
    it('children을 렌더링하지 않는다', () => {
      renderWithRoute(false)
      expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument()
    })

    it('/login 으로 리다이렉트한다', () => {
      renderWithRoute(false)
      expect(screen.getByText('로그인 페이지')).toBeInTheDocument()
    })
  })

  describe('인증 상태', () => {
    it('children을 렌더링한다', () => {
      renderWithRoute(true)
      expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument()
    })

    it('/login 으로 리다이렉트하지 않는다', () => {
      renderWithRoute(true)
      expect(screen.queryByText('로그인 페이지')).not.toBeInTheDocument()
    })
  })
})
