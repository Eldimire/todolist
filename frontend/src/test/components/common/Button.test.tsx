import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../../../components/common/Button'

describe('Button', () => {
  describe('렌더링', () => {
    it('children 텍스트를 렌더링한다', () => {
      render(<Button>저장하기</Button>)
      expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument()
    })

    it('기본 variant는 primary이다', () => {
      render(<Button>버튼</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-blue-600')
    })

    it('secondary variant를 렌더링한다', () => {
      render(<Button variant="secondary">취소</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveClass('bg-white')
      expect(btn).toHaveClass('border')
    })

    it('danger variant를 렌더링한다', () => {
      render(<Button variant="danger">삭제</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-red-500')
    })

    it('추가 className을 적용한다', () => {
      render(<Button className="w-full">버튼</Button>)
      expect(screen.getByRole('button')).toHaveClass('w-full')
    })
  })

  describe('disabled 상태', () => {
    it('disabled prop이 true이면 버튼을 비활성화한다', () => {
      render(<Button disabled>버튼</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('disabled일 때 onClick이 호출되지 않는다', () => {
      const onClick = vi.fn()
      render(<Button disabled onClick={onClick}>버튼</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('loading 상태', () => {
    it('loading이 true이면 "처리 중..." 텍스트를 표시한다', () => {
      render(<Button loading>저장하기</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('처리 중...')
    })

    it('loading이 true이면 버튼을 비활성화한다', () => {
      render(<Button loading>저장하기</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('loading일 때 onClick이 호출되지 않는다', () => {
      const onClick = vi.fn()
      render(<Button loading onClick={onClick}>버튼</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('클릭 이벤트', () => {
    it('활성 상태에서 onClick이 호출된다', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>버튼</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })
})
