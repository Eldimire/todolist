import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryClient'

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

const mockCategory = {
  id: 'cat-1',
  user_id: 'user-1',
  name: '업무',
  is_default: false,
  created_at: '2026-05-28T00:00:00Z',
}

describe('categoryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCategories', () => {
    it('GET /categories를 호출하고 목록을 반환한다', async () => {
      mockGet.mockResolvedValue({ data: { categories: [mockCategory] } })
      const result = await getCategories()
      expect(mockGet).toHaveBeenCalledWith('/categories')
      expect(result.categories).toHaveLength(1)
      expect(result.categories[0].name).toBe('업무')
    })
  })

  describe('createCategory', () => {
    it('POST /categories를 호출한다', async () => {
      mockPost.mockResolvedValue({ data: { category: mockCategory } })
      const result = await createCategory({ name: '업무' })
      expect(mockPost).toHaveBeenCalledWith('/categories', { name: '업무' })
      expect(result.category.name).toBe('업무')
    })
  })

  describe('updateCategory', () => {
    it('PATCH /categories/:id를 호출한다', async () => {
      const updated = { ...mockCategory, name: '개인' }
      mockPatch.mockResolvedValue({ data: { category: updated } })
      const result = await updateCategory('cat-1', { name: '개인' })
      expect(mockPatch).toHaveBeenCalledWith('/categories/cat-1', { name: '개인' })
      expect(result.category.name).toBe('개인')
    })
  })

  describe('deleteCategory', () => {
    it('DELETE /categories/:id를 호출한다', async () => {
      mockDelete.mockResolvedValue({ data: {} })
      await deleteCategory('cat-1')
      expect(mockDelete).toHaveBeenCalledWith('/categories/cat-1')
    })
  })
})
