import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MainLayout } from '../../../components/layout/MainLayout'

vi.mock('../../../hooks/useAuth', () => ({
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}))

function renderMainLayout(children?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <MainLayout>{children ?? <p>콘텐츠</p>}</MainLayout>
    </MemoryRouter>
  )
}

describe('MainLayout', () => {
  it('Header를 렌더링한다 (TodoList 타이틀 확인)', () => {
    renderMainLayout()
    expect(screen.getByText('TodoList')).toBeInTheDocument()
  })

  it('children을 렌더링한다', () => {
    renderMainLayout(<p>메인 콘텐츠</p>)
    expect(screen.getByText('메인 콘텐츠')).toBeInTheDocument()
  })

  it('"내 정보 수정" 링크를 렌더링한다', () => {
    renderMainLayout()
    expect(screen.getByRole('link', { name: '내 정보 수정' })).toBeInTheDocument()
  })

  it('"로그아웃" 버튼을 렌더링한다', () => {
    renderMainLayout()
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
  })
})
