import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthLayout } from '../../../components/layout/AuthLayout'

describe('AuthLayout', () => {
  describe('렌더링', () => {
    it('children을 렌더링한다', () => {
      render(
        <AuthLayout>
          <p>테스트 내용</p>
        </AuthLayout>
      )
      expect(screen.getByText('테스트 내용')).toBeInTheDocument()
    })

    it('title이 제공되면 heading을 렌더링한다', () => {
      render(
        <AuthLayout title="로그인">
          <p>내용</p>
        </AuthLayout>
      )
      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
    })

    it('title이 없으면 heading을 렌더링하지 않는다', () => {
      render(
        <AuthLayout>
          <p>내용</p>
        </AuthLayout>
      )
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('여러 children을 렌더링한다', () => {
      render(
        <AuthLayout title="테스트">
          <p>첫 번째</p>
          <p>두 번째</p>
        </AuthLayout>
      )
      expect(screen.getByText('첫 번째')).toBeInTheDocument()
      expect(screen.getByText('두 번째')).toBeInTheDocument()
    })
  })
})
