import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTodos, createTodo, updateTodo, deleteTodo, toggleComplete } from '../../api/todoClient'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock('../../api/client', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}))

const mockTodo = {
  id: 'todo-1',
  user_id: 'user-1',
  category_id: 'cat-1',
  title: '프로젝트 기획',
  description: null,
  start_date: '2026-05-28',
  end_date: '2026-06-10',
  is_completed: false,
  created_at: '2026-05-28T00:00:00Z',
  updated_at: '2026-05-28T00:00:00Z',
}

describe('todoClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTodos', () => {
    it('GET /todos를 호출하고 목록을 반환한다', async () => {
      mockGet.mockResolvedValue({ data: { todos: [mockTodo] } })
      const result = await getTodos()
      expect(mockGet).toHaveBeenCalledWith('/todos', { params: undefined })
      expect(result.todos).toHaveLength(1)
    })

    it('status 필터를 쿼리 파라미터로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: { todos: [] } })
      await getTodos({ status: 'in_progress' })
      expect(mockGet).toHaveBeenCalledWith('/todos', { params: { status: 'in_progress' } })
    })

    it('categoryId 필터를 쿼리 파라미터로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: { todos: [] } })
      await getTodos({ categoryId: 'cat-1' })
      expect(mockGet).toHaveBeenCalledWith('/todos', { params: { categoryId: 'cat-1' } })
    })
  })

  describe('createTodo', () => {
    it('POST /todos를 호출한다', async () => {
      mockPost.mockResolvedValue({ data: { todo: mockTodo } })
      const result = await createTodo({
        title: '프로젝트 기획',
        startDate: '2026-05-28',
        endDate: '2026-06-10',
      })
      expect(mockPost).toHaveBeenCalledWith('/todos', {
        title: '프로젝트 기획',
        startDate: '2026-05-28',
        endDate: '2026-06-10',
      })
      expect(result.todo.title).toBe('프로젝트 기획')
    })
  })

  describe('updateTodo', () => {
    it('PATCH /todos/:id를 호출한다', async () => {
      const updated = { ...mockTodo, title: '수정된 제목' }
      mockPatch.mockResolvedValue({ data: { todo: updated } })
      const result = await updateTodo('todo-1', { title: '수정된 제목' })
      expect(mockPatch).toHaveBeenCalledWith('/todos/todo-1', { title: '수정된 제목' })
      expect(result.todo.title).toBe('수정된 제목')
    })
  })

  describe('deleteTodo', () => {
    it('DELETE /todos/:id를 호출한다', async () => {
      mockDelete.mockResolvedValue({ data: {} })
      await deleteTodo('todo-1')
      expect(mockDelete).toHaveBeenCalledWith('/todos/todo-1')
    })
  })

  describe('toggleComplete', () => {
    it('PATCH /todos/:id/complete를 호출한다', async () => {
      const completed = { ...mockTodo, is_completed: true }
      mockPatch.mockResolvedValue({ data: { todo: completed } })
      const result = await toggleComplete('todo-1')
      expect(mockPatch).toHaveBeenCalledWith('/todos/todo-1/complete')
      expect(result.todo.is_completed).toBe(true)
    })
  })
})
