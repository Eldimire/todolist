import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCategories, useCategoryMutation } from '../../hooks/useCategory'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryClient'

vi.mock('../../api/categoryClient')

const mockGetCategories = vi.mocked(getCategories)
const mockCreateCategory = vi.mocked(createCategory)
const mockUpdateCategory = vi.mocked(updateCategory)
const mockDeleteCategory = vi.mocked(deleteCategory)

const mockCategories = [
  { id: 'cat-1', user_id: 'user-1', name: '기본', is_default: true, created_at: '2026-01-01' },
  { id: 'cat-2', user_id: 'user-1', name: '업무', is_default: false, created_at: '2026-01-02' },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCategories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('카테고리 배열을 반환한다', async () => {
    mockGetCategories.mockResolvedValueOnce({ categories: mockCategories })

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockCategories)
  })

  it('데이터 로딩 중에는 isLoading이 true이다', () => {
    mockGetCategories.mockImplementationOnce(() => new Promise(() => {}))

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('API 오류 시 isError가 true이다', async () => {
    mockGetCategories.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCategoryMutation - create', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createCategory를 호출한다', async () => {
    const newCategory = { id: 'cat-3', user_id: 'u1', name: '개인', is_default: false, created_at: '...' }
    mockCreateCategory.mockResolvedValueOnce({ category: newCategory })
    mockGetCategories.mockResolvedValue({ categories: mockCategories })

    const { result } = renderHook(() => useCategoryMutation(), { wrapper: createWrapper() })

    result.current.create.mutate({ name: '개인' })

    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))

    expect(mockCreateCategory).toHaveBeenCalledWith({ name: '개인' })
  })

  it('create 실패 시 isError가 true이다', async () => {
    mockCreateCategory.mockRejectedValueOnce({
      response: { data: { code: 'VALIDATION_ERROR', message: '...' } },
    })

    const { result } = renderHook(() => useCategoryMutation(), { wrapper: createWrapper() })

    result.current.create.mutate({ name: '' })

    await waitFor(() => expect(result.current.create.isError).toBe(true))
  })
})

describe('useCategoryMutation - update', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updateCategory를 올바른 인수로 호출한다', async () => {
    const updated = { ...mockCategories[1], name: '수정된 이름' }
    mockUpdateCategory.mockResolvedValueOnce({ category: updated })
    mockGetCategories.mockResolvedValue({ categories: mockCategories })

    const { result } = renderHook(() => useCategoryMutation(), { wrapper: createWrapper() })

    result.current.update.mutate({ id: 'cat-2', data: { name: '수정된 이름' } })

    await waitFor(() => expect(result.current.update.isSuccess).toBe(true))

    expect(mockUpdateCategory).toHaveBeenCalledWith('cat-2', { name: '수정된 이름' })
  })

  it('기본 카테고리 수정 시 422 에러가 발생한다', async () => {
    mockUpdateCategory.mockRejectedValueOnce({
      response: { data: { code: 'DEFAULT_CATEGORY_NOT_MODIFIABLE', message: '...' } },
    })

    const { result } = renderHook(() => useCategoryMutation(), { wrapper: createWrapper() })

    result.current.update.mutate({ id: 'cat-1', data: { name: '수정' } })

    await waitFor(() => expect(result.current.update.isError).toBe(true))

    expect(mockUpdateCategory).toHaveBeenCalledWith('cat-1', { name: '수정' })
  })
})

describe('useCategoryMutation - remove', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deleteCategory를 호출한다', async () => {
    mockDeleteCategory.mockResolvedValueOnce(undefined)
    mockGetCategories.mockResolvedValue({ categories: [mockCategories[0]] })

    const { result } = renderHook(() => useCategoryMutation(), { wrapper: createWrapper() })

    result.current.remove.mutate('cat-2')

    await waitFor(() => expect(result.current.remove.isSuccess).toBe(true))

    expect(mockDeleteCategory).toHaveBeenCalledWith('cat-2')
  })

  it('기본 카테고리 삭제 시 422 에러가 발생한다', async () => {
    mockDeleteCategory.mockRejectedValueOnce({
      response: { data: { code: 'DEFAULT_CATEGORY_NOT_DELETABLE', message: '...' } },
    })

    const { result } = renderHook(() => useCategoryMutation(), { wrapper: createWrapper() })

    result.current.remove.mutate('cat-1')

    await waitFor(() => expect(result.current.remove.isError).toBe(true))
  })
})
