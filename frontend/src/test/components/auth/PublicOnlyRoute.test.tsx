import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PublicOnlyRoute } from '../../../components/auth/PublicOnlyRoute'
import { useAuthStore } from '../../../stores/authStore'

function renderWithRoute(authenticated: boolean) {
  useAuthStore.setState({ token: authenticated ? 'test-token' : null, user: null })
  return render(
    <MemoryRouter initialEntries={['/public']}>
      <Routes>
        <Route
          path="/public"
          element={
            <PublicOnlyRoute>
              <div>공개 콘텐츠</div>
            </PublicOnlyRoute>
          }
        />
        <Route path="/" element={<div>홈 페이지</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null })
  })

  describe('미인증 상태', () => {
    it('children을 렌더링한다', () => {
      renderWithRoute(false)
      expect(screen.getByText('공개 콘텐츠')).toBeInTheDocument()
    })

    it('/ 로 리다이렉트하지 않는다', () => {
      renderWithRoute(false)
      expect(screen.queryByText('홈 페이지')).not.toBeInTheDocument()
    })
  })

  describe('인증 상태', () => {
    it('children을 렌더링하지 않는다', () => {
      renderWithRoute(true)
      expect(screen.queryByText('공개 콘텐츠')).not.toBeInTheDocument()
    })

    it('/ 로 리다이렉트한다', () => {
      renderWithRoute(true)
      expect(screen.getByText('홈 페이지')).toBeInTheDocument()
    })
  })
})
