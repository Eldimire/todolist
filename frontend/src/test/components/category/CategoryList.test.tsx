import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryList } from '../../../components/category/CategoryList'
import * as useCategoryModule from '../../../hooks/useCategory'

vi.mock('../../../hooks/useCategory')

const mockCategories = [
  { id: 'cat-1', user_id: 'u1', name: '기본', is_default: true, created_at: '...' },
  { id: 'cat-2', user_id: 'u1', name: '업무', is_default: false, created_at: '...' },
]

const mockCreate = { mutate: vi.fn(), isPending: false }
const mockUpdate = { mutate: vi.fn(), isPending: false }
const mockRemove = { mutate: vi.fn(), isPending: false }

function setupMocks(overrides?: Partial<typeof mockCategories[0]>[]) {
  vi.mocked(useCategoryModule.useCategories).mockReturnValue({
    data: overrides ?? mockCategories,
    isLoading: false,
  } as ReturnType<typeof useCategoryModule.useCategories>)
  vi.mocked(useCategoryModule.useCategoryMutation).mockReturnValue({
    create: mockCreate,
    update: mockUpdate,
    remove: mockRemove,
  } as ReturnType<typeof useCategoryModule.useCategoryMutation>)
}

describe('CategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  describe('렌더링', () => {
    it('카테고리 목록을 렌더링한다', () => {
      render(<CategoryList />)
      expect(screen.getAllByText('기본').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('업무')).toBeInTheDocument()
    })

    it('기본 카테고리에 "기본" 배지를 표시한다', () => {
      render(<CategoryList />)
      const badges = screen.getAllByText('기본')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('기본 카테고리에는 수정·삭제 버튼이 없다', () => {
      render(<CategoryList />)
      const buttons = screen.queryAllByRole('button', { name: '수정' })
      expect(buttons).toHaveLength(1)
    })

    it('일반 카테고리에는 수정·삭제 버튼이 있다', () => {
      render(<CategoryList />)
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
    })

    it('새 카테고리 이름 입력 필드와 추가 버튼을 렌더링한다', () => {
      render(<CategoryList />)
      expect(screen.getByLabelText('새 카테고리 이름')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument()
    })

    it('isLoading이 true일 때 로딩 메시지를 표시한다', () => {
      vi.mocked(useCategoryModule.useCategories).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as ReturnType<typeof useCategoryModule.useCategories>)

      render(<CategoryList />)
      expect(screen.getByText('카테고리를 불러오는 중...')).toBeInTheDocument()
    })
  })

  describe('카테고리 생성', () => {
    it('새 카테고리 이름을 입력하고 추가 버튼 클릭 시 create.mutate를 호출한다', () => {
      render(<CategoryList />)
      fireEvent.change(screen.getByLabelText('새 카테고리 이름'), {
        target: { value: '개인' },
      })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))
      expect(mockCreate.mutate).toHaveBeenCalledWith(
        { name: '개인' },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      )
    })

    it('빈 이름으로 추가 시 mutate를 호출하지 않는다', () => {
      render(<CategoryList />)
      fireEvent.click(screen.getByRole('button', { name: '추가' }))
      expect(mockCreate.mutate).not.toHaveBeenCalled()
    })

    it('create API 오류 시 에러 메시지를 표시한다', () => {
      vi.mocked(useCategoryModule.useCategoryMutation).mockReturnValue({
        create: {
          mutate: vi.fn().mockImplementation((_, callbacks) => {
            callbacks?.onError?.({
              response: { data: { code: 'VALIDATION_ERROR', message: '...' } },
            })
          }),
          isPending: false,
        },
        update: mockUpdate,
        remove: mockRemove,
      } as ReturnType<typeof useCategoryModule.useCategoryMutation>)

      render(<CategoryList />)
      fireEvent.change(screen.getByLabelText('새 카테고리 이름'), { target: { value: '새카테고리' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))
      expect(screen.getByRole('alert')).toHaveTextContent('입력값을 확인해주세요.')
    })
  })

  describe('카테고리 수정', () => {
    it('수정 버튼 클릭 시 인라인 편집 모드로 전환된다', () => {
      render(<CategoryList />)
      fireEvent.click(screen.getByRole('button', { name: '수정' }))
      expect(screen.getByLabelText('카테고리 이름 수정')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    })

    it('저장 버튼 클릭 시 update.mutate를 호출한다', () => {
      render(<CategoryList />)
      fireEvent.click(screen.getByRole('button', { name: '수정' }))
      const editInput = screen.getByLabelText('카테고리 이름 수정')
      fireEvent.change(editInput, { target: { value: '수정된 이름' } })
      fireEvent.click(screen.getByRole('button', { name: '저장' }))
      expect(mockUpdate.mutate).toHaveBeenCalledWith(
        { id: 'cat-2', data: { name: '수정된 이름' } },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      )
    })

    it('취소 버튼 클릭 시 편집 모드를 종료한다', () => {
      render(<CategoryList />)
      fireEvent.click(screen.getByRole('button', { name: '수정' }))
      fireEvent.click(screen.getByRole('button', { name: '취소' }))
      expect(screen.queryByLabelText('카테고리 이름 수정')).not.toBeInTheDocument()
    })

    it('기본 카테고리 수정 시 422 에러 메시지를 표시한다', () => {
      vi.mocked(useCategoryModule.useCategoryMutation).mockReturnValue({
        create: mockCreate,
        update: {
          mutate: vi.fn().mockImplementation((_, callbacks) => {
            callbacks?.onError?.({
              response: {
                data: { code: 'DEFAULT_CATEGORY_NOT_MODIFIABLE', message: '...' },
              },
            })
          }),
          isPending: false,
        },
        remove: mockRemove,
      } as ReturnType<typeof useCategoryModule.useCategoryMutation>)

      vi.mocked(useCategoryModule.useCategories).mockReturnValue({
        data: [{ id: 'cat-2', user_id: 'u1', name: '업무', is_default: false, created_at: '...' }],
        isLoading: false,
      } as ReturnType<typeof useCategoryModule.useCategories>)

      render(<CategoryList />)
      fireEvent.click(screen.getByRole('button', { name: '수정' }))
      fireEvent.click(screen.getByRole('button', { name: '저장' }))
      expect(screen.getByRole('alert')).toHaveTextContent(
        '기본 카테고리는 수정할 수 없습니다.'
      )
    })
  })

  describe('카테고리 삭제', () => {
    it('삭제 버튼 클릭 후 confirm 확인 시 remove.mutate를 호출한다', () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(true)

      render(<CategoryList />)
      fireEvent.click(screen.getByRole('button', { name: '삭제' }))
      expect(mockRemove.mutate).toHaveBeenCalledWith(
        'cat-2',
        expect.objectContaining({ onError: expect.any(Function) })
      )
    })

    it('삭제 버튼 클릭 후 confirm 취소 시 remove.mutate를 호출하지 않는다', () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(false)

      render(<CategoryList />)
      fireEvent.click(screen.getByRole('button', { name: '삭제' }))
      expect(mockRemove.mutate).not.toHaveBeenCalled()
    })

    it('기본 카테고리 삭제 시 422 에러 메시지를 표시한다', () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(true)

      vi.mocked(useCategoryModule.useCategoryMutation).mockReturnValue({
        create: mockCreate,
        update: mockUpdate,
        remove: {
          mutate: vi.fn().mockImplementation((_, callbacks) => {
            callbacks?.onError?.({
              response: {
                data: { code: 'DEFAULT_CATEGORY_NOT_DELETABLE', message: '...' },
              },
            })
          }),
          isPending: false,
        },
      } as ReturnType<typeof useCategoryModule.useCategoryMutation>)

      render(<CategoryList />)
      fireEvent.click(screen.getByRole('button', { name: '삭제' }))
      expect(screen.getByRole('alert')).toHaveTextContent(
        '기본 카테고리는 삭제할 수 없습니다.'
      )
    })
  })
})
