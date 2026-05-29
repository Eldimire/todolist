import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTodos } from '../../hooks/useTodoList'
import { getTodos } from '../../api/todoClient'

vi.mock('../../api/todoClient')

const mockGetTodos = vi.mocked(getTodos)

const mockTodos = [
  {
    id: 'todo-1',
    user_id: 'u1',
    category_id: 'cat-1',
    title: '첫 번째 할일',
    description: null,
    start_date: '2026-05-29',
    end_date: '2026-05-30',
    is_completed: false,
    created_at: '2026-05-29',
    updated_at: '2026-05-29',
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useTodos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('할일 배열을 반환한다', async () => {
    mockGetTodos.mockResolvedValueOnce({ todos: mockTodos })

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTodos)
  })

  it('필터 파라미터를 전달한다', async () => {
    mockGetTodos.mockResolvedValueOnce({ todos: [] })

    const { result } = renderHook(
      () => useTodos({ status: 'in_progress' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGetTodos).toHaveBeenCalledWith({ status: 'in_progress' })
  })

  it('categoryId 파라미터를 전달한다', async () => {
    mockGetTodos.mockResolvedValueOnce({ todos: [] })

    const { result } = renderHook(
      () => useTodos({ categoryId: 'cat-1' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGetTodos).toHaveBeenCalledWith({ categoryId: 'cat-1' })
  })

  it('데이터 로딩 중에는 isLoading이 true이다', () => {
    mockGetTodos.mockImplementationOnce(() => new Promise(() => {}))

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('API 오류 시 isError가 true이다', async () => {
    mockGetTodos.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
