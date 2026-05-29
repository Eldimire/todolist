import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from '../../stores/uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ activeFilter: 'all', selectedCategoryId: null })
  })

  describe('초기 상태', () => {
    it('activeFilter가 "all"이다', () => {
      expect(useUiStore.getState().activeFilter).toBe('all')
    })

    it('selectedCategoryId가 null이다', () => {
      expect(useUiStore.getState().selectedCategoryId).toBeNull()
    })
  })

  describe('setFilter', () => {
    it('"not_started" 필터로 변경한다', () => {
      useUiStore.getState().setFilter('not_started')
      expect(useUiStore.getState().activeFilter).toBe('not_started')
    })

    it('"in_progress" 필터로 변경한다', () => {
      useUiStore.getState().setFilter('in_progress')
      expect(useUiStore.getState().activeFilter).toBe('in_progress')
    })

    it('"completed" 필터로 변경한다', () => {
      useUiStore.getState().setFilter('completed')
      expect(useUiStore.getState().activeFilter).toBe('completed')
    })

    it('"overdue" 필터로 변경한다', () => {
      useUiStore.getState().setFilter('overdue')
      expect(useUiStore.getState().activeFilter).toBe('overdue')
    })

    it('"category" 필터로 변경한다', () => {
      useUiStore.getState().setFilter('category')
      expect(useUiStore.getState().activeFilter).toBe('category')
    })

    it('"all" 필터로 다시 변경한다', () => {
      useUiStore.getState().setFilter('in_progress')
      useUiStore.getState().setFilter('all')
      expect(useUiStore.getState().activeFilter).toBe('all')
    })
  })

  describe('setCategory', () => {
    it('카테고리 ID를 설정한다', () => {
      useUiStore.getState().setCategory('cat-1')
      expect(useUiStore.getState().selectedCategoryId).toBe('cat-1')
    })

    it('null로 카테고리를 초기화한다', () => {
      useUiStore.getState().setCategory('cat-1')
      useUiStore.getState().setCategory(null)
      expect(useUiStore.getState().selectedCategoryId).toBeNull()
    })

    it('다른 카테고리 ID로 변경한다', () => {
      useUiStore.getState().setCategory('cat-1')
      useUiStore.getState().setCategory('cat-2')
      expect(useUiStore.getState().selectedCategoryId).toBe('cat-2')
    })
  })
})
