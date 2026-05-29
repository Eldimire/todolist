import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from '../../pages/NotFoundPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  )
}

describe('NotFoundPage', () => {
  it('404 텍스트를 표시한다', () => {
    renderPage()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('페이지를 찾을 수 없다는 안내 메시지를 표시한다', () => {
    renderPage()
    expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument()
  })

  it('홈으로 가기 링크를 표시한다', () => {
    renderPage()
    expect(screen.getByRole('link', { name: '홈으로 가기' })).toBeInTheDocument()
  })

  it('홈으로 가기 링크의 href가 / 이다', () => {
    renderPage()
    const link = screen.getByRole('link', { name: '홈으로 가기' })
    expect(link).toHaveAttribute('href', '/')
  })
})
