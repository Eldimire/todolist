import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCreateTodo, useUpdateTodo, useDeleteTodo, useToggleComplete } from '../../hooks/useTodoMutation'
import { createTodo, updateTodo, deleteTodo, toggleComplete } from '../../api/todoClient'

vi.mock('../../api/todoClient')

const mockCreateTodo = vi.mocked(createTodo)
const mockUpdateTodo = vi.mocked(updateTodo)
const mockDeleteTodo = vi.mocked(deleteTodo)
const mockToggleComplete = vi.mocked(toggleComplete)

const mockTodo = {
  id: 'todo-1',
  user_id: 'u1',
  category_id: 'cat-1',
  title: '테스트 할일',
  description: null,
  start_date: '2026-05-29',
  end_date: '2026-05-30',
  is_completed: false,
  created_at: '2026-05-29',
  updated_at: '2026-05-29',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCreateTodo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createTodo를 호출한다', async () => {
    mockCreateTodo.mockResolvedValueOnce({ todo: mockTodo })

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() })

    result.current.mutate({
      title: '테스트 할일',
      startDate: '2026-05-29',
      endDate: '2026-05-30',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockCreateTodo).toHaveBeenCalledWith({
      title: '테스트 할일',
      startDate: '2026-05-29',
      endDate: '2026-05-30',
    })
  })

  it('실패 시 isError가 true이다', async () => {
    mockCreateTodo.mockRejectedValueOnce({
      response: { data: { code: 'VALIDATION_ERROR', message: '...' } },
    })

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() })

    result.current.mutate({ title: '', startDate: '2026-05-29', endDate: '2026-05-30' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useUpdateTodo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updateTodo를 올바른 인수로 호출한다', async () => {
    const updated = { ...mockTodo, title: '수정된 할일' }
    mockUpdateTodo.mockResolvedValueOnce({ todo: updated })

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: createWrapper() })

    result.current.mutate({ id: 'todo-1', data: { title: '수정된 할일' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockUpdateTodo).toHaveBeenCalledWith('todo-1', { title: '수정된 할일' })
  })

  it('실패 시 isError가 true이다', async () => {
    mockUpdateTodo.mockRejectedValueOnce({
      response: { data: { code: 'TODO_NOT_FOUND', message: '...' } },
    })

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: createWrapper() })

    result.current.mutate({ id: 'todo-1', data: { title: '수정' } })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useDeleteTodo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deleteTodo를 호출한다', async () => {
    mockDeleteTodo.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteTodo(), { wrapper: createWrapper() })

    result.current.mutate('todo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockDeleteTodo).toHaveBeenCalledWith('todo-1')
  })

  it('실패 시 isError가 true이다', async () => {
    mockDeleteTodo.mockRejectedValueOnce({
      response: { data: { code: 'TODO_NOT_FOUND', message: '...' } },
    })

    const { result } = renderHook(() => useDeleteTodo(), { wrapper: createWrapper() })

    result.current.mutate('todo-1')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useToggleComplete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('toggleComplete를 호출한다', async () => {
    const toggled = { ...mockTodo, is_completed: true }
    mockToggleComplete.mockResolvedValueOnce({ todo: toggled })

    const { result } = renderHook(() => useToggleComplete(), { wrapper: createWrapper() })

    result.current.mutate('todo-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockToggleComplete).toHaveBeenCalledWith('todo-1')
  })

  it('실패 시 isError가 true이다', async () => {
    mockToggleComplete.mockRejectedValueOnce({
      response: { data: { code: 'TODO_NOT_FOUND', message: '...' } },
    })

    const { result } = renderHook(() => useToggleComplete(), { wrapper: createWrapper() })

    result.current.mutate('todo-1')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
