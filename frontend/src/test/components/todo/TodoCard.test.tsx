import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TodoCard } from '../../../components/todo/TodoCard'
import * as useTodoMutationModule from '../../../hooks/useTodoMutation'

vi.mock('../../../hooks/useTodoMutation')

const mockToggleMutation = { mutate: vi.fn(), isPending: false }

const baseTodo = {
  id: 'todo-1',
  user_id: 'u1',
  category_id: 'cat-1',
  title: '테스트 할일',
  description: '설명 텍스트',
  start_date: '2026-05-29',
  end_date: '2026-05-30',
  is_completed: false,
  created_at: '2026-05-29',
  updated_at: '2026-05-29',
}

function setupMocks() {
  vi.mocked(useTodoMutationModule.useToggleComplete).mockReturnValue(
    mockToggleMutation as unknown as ReturnType<typeof useTodoMutationModule.useToggleComplete>
  )
}

describe('TodoCard', () => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  describe('렌더링', () => {
    it('제목을 표시한다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByText('테스트 할일')).toBeInTheDocument()
    })

    it('시작일을 표시한다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByText(/2026-05-29/)).toBeInTheDocument()
    })

    it('종료일을 표시한다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByText(/2026-05-30/)).toBeInTheDocument()
    })

    it('카테고리명을 표시한다', () => {
      render(<TodoCard todo={baseTodo} categoryName="업무" onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByText('업무')).toBeInTheDocument()
    })

    it('is_completed가 false이고 오늘이 날짜 범위 내이면 진행 중 배지를 표시한다', () => {
      const todo = { ...baseTodo, start_date: '2026-01-01', end_date: '2099-12-31', is_completed: false }
      render(<TodoCard todo={todo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByText('진행 중')).toBeInTheDocument()
    })

    it('is_completed가 true이면 완료 배지를 표시한다', () => {
      const todo = { ...baseTodo, is_completed: true }
      render(<TodoCard todo={todo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByText('완료')).toBeInTheDocument()
    })

    it('오늘이 start_date 이전이면 시작 전 배지를 표시한다', () => {
      const todo = { ...baseTodo, start_date: '2099-01-01', end_date: '2099-12-31', is_completed: false }
      render(<TodoCard todo={todo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByText('시작 전')).toBeInTheDocument()
    })

    it('오늘이 end_date 이후이면 기한 초과 배지를 표시한다', () => {
      const todo = { ...baseTodo, start_date: '2020-01-01', end_date: '2020-12-31', is_completed: false }
      render(<TodoCard todo={todo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByText('기한 초과')).toBeInTheDocument()
    })

    it('수정 버튼을 표시한다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument()
    })

    it('삭제 버튼을 표시한다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
    })

    it('완료 체크박스를 표시한다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('완료된 할일의 체크박스는 체크되어 있다', () => {
      const todo = { ...baseTodo, is_completed: true }
      render(<TodoCard todo={todo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('미완료 할일의 체크박스는 체크되어 있지 않다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })
  })

  describe('인터랙션', () => {
    it('체크박스 클릭 시 toggleMutation.mutate를 호출한다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      fireEvent.click(screen.getByRole('checkbox'))
      expect(mockToggleMutation.mutate).toHaveBeenCalledWith('todo-1')
    })

    it('수정 버튼 클릭 시 onEdit를 호출한다', () => {
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      fireEvent.click(screen.getByRole('button', { name: '수정' }))
      expect(onEdit).toHaveBeenCalledWith('todo-1')
    })

    it('삭제 버튼 클릭 후 confirm 확인 시 onDelete를 호출한다', () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      fireEvent.click(screen.getByRole('button', { name: '삭제' }))
      expect(onDelete).toHaveBeenCalledWith('todo-1')
    })

    it('삭제 버튼 클릭 후 confirm 취소 시 onDelete를 호출하지 않는다', () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(false)
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      fireEvent.click(screen.getByRole('button', { name: '삭제' }))
      expect(onDelete).not.toHaveBeenCalled()
    })

    it('isPending 중에는 체크박스가 비활성화된다', () => {
      vi.mocked(useTodoMutationModule.useToggleComplete).mockReturnValue(
        { mutate: vi.fn(), isPending: true } as unknown as ReturnType<typeof useTodoMutationModule.useToggleComplete>
      )
      render(<TodoCard todo={baseTodo} onEdit={onEdit} onDelete={onDelete} />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
  })
})
