import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TodoListPage } from '../../pages/TodoListPage'
import { useUiStore } from '../../stores/uiStore'
import * as useTodoListModule from '../../hooks/useTodoList'
import * as useCategoryModule from '../../hooks/useCategory'
import * as useTodoMutationModule from '../../hooks/useTodoMutation'

vi.mock('../../components/todo/TodoCard', () => ({
  TodoCard: ({ todo, categoryName, onEdit, onDelete }: {
    todo: { id: string; title: string };
    categoryName?: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => (
    <div data-testid={`todo-card-${todo.id}`}>
      <span>{todo.title}</span>
      {categoryName && <span data-testid="category-name">{categoryName}</span>}
      <button onClick={() => onEdit(todo.id)}>수정</button>
      <button onClick={() => onDelete(todo.id)}>삭제</button>
    </div>
  ),
}))

vi.mock('../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}))

vi.mock('../../hooks/useTodoList')
vi.mock('../../hooks/useCategory')
vi.mock('../../hooks/useTodoMutation')

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockTodos = [
  {
    id: 'todo-1',
    user_id: 'u1',
    category_id: 'cat-1',
    title: '첫 번째 할일',
    description: null,
    start_date: '2026-01-01',
    end_date: '2099-12-31',
    is_completed: false,
    created_at: '2026-05-29',
    updated_at: '2026-05-29',
  },
  {
    id: 'todo-2',
    user_id: 'u1',
    category_id: 'cat-2',
    title: '두 번째 할일',
    description: null,
    start_date: '2020-01-01',
    end_date: '2020-12-31',
    is_completed: false,
    created_at: '2026-05-29',
    updated_at: '2026-05-29',
  },
]

const mockCategories = [
  { id: 'cat-1', user_id: 'u1', name: '기본', is_default: true, created_at: '...' },
  { id: 'cat-2', user_id: 'u1', name: '업무', is_default: false, created_at: '...' },
]

const mockDelete = { mutate: vi.fn(), isPending: false }

function setupMocks(todosOverride = mockTodos, isLoading = false) {
  vi.mocked(useTodoListModule.useTodos).mockReturnValue({
    data: todosOverride,
    isLoading,
  } as unknown as ReturnType<typeof useTodoListModule.useTodos>)

  vi.mocked(useCategoryModule.useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  } as unknown as ReturnType<typeof useCategoryModule.useCategories>)

  vi.mocked(useTodoMutationModule.useDeleteTodo).mockReturnValue(
    mockDelete as unknown as ReturnType<typeof useTodoMutationModule.useDeleteTodo>
  )
}

describe('TodoListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUiStore.setState({ activeFilter: 'all', selectedCategoryId: null })
    setupMocks()
  })

  describe('렌더링', () => {
    it('필터 탭 6개를 표시한다', () => {
      render(<TodoListPage />)
      expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '카테고리' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '시작 전' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '진행 중' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '기한 초과' })).toBeInTheDocument()
    })

    it('할일 추가 버튼을 표시한다', () => {
      render(<TodoListPage />)
      expect(screen.getByRole('button', { name: '+ 할일 추가' })).toBeInTheDocument()
    })

    it('할일 목록을 렌더링한다', () => {
      render(<TodoListPage />)
      expect(screen.getByTestId('todo-card-todo-1')).toBeInTheDocument()
      expect(screen.getByTestId('todo-card-todo-2')).toBeInTheDocument()
    })

    it('할일 카드에 카테고리명을 전달한다', () => {
      render(<TodoListPage />)
      const categoryNames = screen.getAllByTestId('category-name')
      expect(categoryNames[0]).toHaveTextContent('기본')
      expect(categoryNames[1]).toHaveTextContent('업무')
    })

    it('isLoading이 true일 때 로딩 메시지를 표시한다', () => {
      setupMocks([], true)
      render(<TodoListPage />)
      expect(screen.getByText('할일을 불러오는 중...')).toBeInTheDocument()
    })

    it('할일이 없을 때 빈 상태 메시지를 표시한다', () => {
      setupMocks([])
      render(<TodoListPage />)
      expect(screen.getByText('할일이 없습니다.')).toBeInTheDocument()
    })
  })

  describe('필터 탭', () => {
    it('전체 탭이 기본 활성화되어 있다', () => {
      render(<TodoListPage />)
      const allTab = screen.getByRole('button', { name: '전체' })
      expect(allTab.className).toContain('bg-white')
    })

    it('시작 전 탭 클릭 시 activeFilter가 not_started로 변경된다', () => {
      render(<TodoListPage />)
      fireEvent.click(screen.getByRole('button', { name: '시작 전' }))
      expect(useUiStore.getState().activeFilter).toBe('not_started')
    })

    it('진행 중 탭 클릭 시 activeFilter가 in_progress로 변경된다', () => {
      render(<TodoListPage />)
      fireEvent.click(screen.getByRole('button', { name: '진행 중' }))
      expect(useUiStore.getState().activeFilter).toBe('in_progress')
    })

    it('완료 탭 클릭 시 activeFilter가 completed로 변경된다', () => {
      render(<TodoListPage />)
      fireEvent.click(screen.getByRole('button', { name: '완료' }))
      expect(useUiStore.getState().activeFilter).toBe('completed')
    })

    it('기한 초과 탭 클릭 시 activeFilter가 overdue로 변경된다', () => {
      render(<TodoListPage />)
      fireEvent.click(screen.getByRole('button', { name: '기한 초과' }))
      expect(useUiStore.getState().activeFilter).toBe('overdue')
    })

    it('카테고리 탭 클릭 시 카테고리 드롭다운이 표시된다', () => {
      render(<TodoListPage />)
      fireEvent.click(screen.getByRole('button', { name: '카테고리' }))
      expect(screen.getByRole('combobox', { name: '카테고리 선택' })).toBeInTheDocument()
    })

    it('카테고리 탭이 아닌 탭 클릭 시 드롭다운이 사라진다', () => {
      useUiStore.setState({ activeFilter: 'category', selectedCategoryId: null })
      render(<TodoListPage />)
      fireEvent.click(screen.getByRole('button', { name: '전체' }))
      expect(screen.queryByRole('combobox', { name: '카테고리 선택' })).not.toBeInTheDocument()
    })
  })

  describe('카테고리 드롭다운', () => {
    beforeEach(() => {
      useUiStore.setState({ activeFilter: 'category', selectedCategoryId: null })
    })

    it('카테고리 목록을 표시한다', () => {
      render(<TodoListPage />)
      expect(screen.getByRole('option', { name: '기본' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '업무' })).toBeInTheDocument()
    })

    it('카테고리 선택 시 selectedCategoryId가 변경된다', () => {
      render(<TodoListPage />)
      fireEvent.change(screen.getByRole('combobox', { name: '카테고리 선택' }), {
        target: { value: 'cat-1' },
      })
      expect(useUiStore.getState().selectedCategoryId).toBe('cat-1')
    })
  })

  describe('할일 추가', () => {
    it('할일 추가 버튼 클릭 시 /todos/new로 이동한다', () => {
      render(<TodoListPage />)
      fireEvent.click(screen.getByRole('button', { name: '+ 할일 추가' }))
      expect(mockNavigate).toHaveBeenCalledWith('/todos/new')
    })

    it('빈 상태의 새 할일 추가 링크 클릭 시 /todos/new로 이동한다', () => {
      setupMocks([])
      render(<TodoListPage />)
      fireEvent.click(screen.getByText('새 할일 추가하기'))
      expect(mockNavigate).toHaveBeenCalledWith('/todos/new')
    })
  })

  describe('할일 삭제', () => {
    it('TodoCard onDelete 호출 시 deleteMutation.mutate를 실행한다', () => {
      render(<TodoListPage />)
      fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[0])
      expect(mockDelete.mutate).toHaveBeenCalledWith('todo-1')
    })
  })

  describe('할일 수정', () => {
    it('TodoCard onEdit 호출 시 수정 페이지로 이동한다', () => {
      render(<TodoListPage />)
      fireEvent.click(screen.getAllByRole('button', { name: '수정' })[0])
      expect(mockNavigate).toHaveBeenCalledWith('/todos/todo-1/edit')
    })
  })
})
