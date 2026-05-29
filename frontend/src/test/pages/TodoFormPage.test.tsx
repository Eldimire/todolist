import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TodoFormPage } from '../../pages/TodoFormPage'
import * as useTodoListModule from '../../hooks/useTodoList'
import * as useCategoryModule from '../../hooks/useCategory'
import * as useTodoMutationModule from '../../hooks/useTodoMutation'

vi.mock('../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}))

vi.mock('../../hooks/useTodoList')
vi.mock('../../hooks/useCategory')
vi.mock('../../hooks/useTodoMutation')

const mockNavigate = vi.hoisted(() => vi.fn())
const mockUseParams = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  }
})

const mockCategories = [
  { id: 'cat-1', user_id: 'u1', name: '기본', is_default: true, created_at: '...' },
  { id: 'cat-2', user_id: 'u1', name: '업무', is_default: false, created_at: '...' },
]

const mockTodo = {
  id: 'todo-1',
  user_id: 'u1',
  category_id: 'cat-2',
  title: '기존 할일 제목',
  description: '기존 설명',
  start_date: '2026-06-01',
  end_date: '2026-06-30',
  is_completed: false,
  created_at: '2026-05-29',
  updated_at: '2026-05-29',
}

const mockCreate = { mutate: vi.fn(), isPending: false }
const mockUpdate = { mutate: vi.fn(), isPending: false }

function setupCreateMode() {
  mockUseParams.mockReturnValue({})
  vi.mocked(useTodoListModule.useTodo).mockReturnValue({
    data: undefined,
    isLoading: false,
  } as ReturnType<typeof useTodoListModule.useTodo>)
  vi.mocked(useCategoryModule.useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  } as ReturnType<typeof useCategoryModule.useCategories>)
  vi.mocked(useTodoMutationModule.useCreateTodo).mockReturnValue(
    mockCreate as ReturnType<typeof useTodoMutationModule.useCreateTodo>
  )
  vi.mocked(useTodoMutationModule.useUpdateTodo).mockReturnValue(
    mockUpdate as ReturnType<typeof useTodoMutationModule.useUpdateTodo>
  )
}

function setupEditMode() {
  mockUseParams.mockReturnValue({ id: 'todo-1' })
  vi.mocked(useTodoListModule.useTodo).mockReturnValue({
    data: mockTodo,
    isLoading: false,
  } as ReturnType<typeof useTodoListModule.useTodo>)
  vi.mocked(useCategoryModule.useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  } as ReturnType<typeof useCategoryModule.useCategories>)
  vi.mocked(useTodoMutationModule.useCreateTodo).mockReturnValue(
    mockCreate as ReturnType<typeof useTodoMutationModule.useCreateTodo>
  )
  vi.mocked(useTodoMutationModule.useUpdateTodo).mockReturnValue(
    mockUpdate as ReturnType<typeof useTodoMutationModule.useUpdateTodo>
  )
}

describe('TodoFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('등록 모드', () => {
    beforeEach(() => {
      setupCreateMode()
    })

    it('"할일 등록" 제목을 표시한다', () => {
      render(<TodoFormPage />)
      expect(screen.getByText('할일 등록')).toBeInTheDocument()
    })

    it('필드들을 표시한다', () => {
      render(<TodoFormPage />)
      expect(screen.getByLabelText('제목')).toBeInTheDocument()
      expect(screen.getByLabelText('설명')).toBeInTheDocument()
      expect(screen.getByLabelText('카테고리')).toBeInTheDocument()
      expect(screen.getByLabelText('시작일자')).toBeInTheDocument()
      expect(screen.getByLabelText('종료일자')).toBeInTheDocument()
    })

    it('저장하기와 취소 버튼을 표시한다', () => {
      render(<TodoFormPage />)
      expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    })

    it('기본 카테고리가 자동 선택된다', async () => {
      render(<TodoFormPage />)
      await waitFor(() => {
        const select = screen.getByLabelText('카테고리') as HTMLSelectElement
        expect(select.value).toBe('cat-1')
      })
    })

    it('제목 미입력 시 에러 메시지를 표시한다', () => {
      render(<TodoFormPage />)
      fireEvent.change(screen.getByLabelText('시작일자'), { target: { value: '2026-06-01' } })
      fireEvent.change(screen.getByLabelText('종료일자'), { target: { value: '2026-06-30' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByText('제목은 필수 입력 항목입니다.')).toBeInTheDocument()
    })

    it('시작일자 미입력 시 에러 메시지를 표시한다', () => {
      render(<TodoFormPage />)
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트' } })
      fireEvent.change(screen.getByLabelText('종료일자'), { target: { value: '2026-06-30' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByText('시작일자는 필수 입력 항목입니다.')).toBeInTheDocument()
    })

    it('종료일자 미입력 시 에러 메시지를 표시한다', () => {
      render(<TodoFormPage />)
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트' } })
      fireEvent.change(screen.getByLabelText('시작일자'), { target: { value: '2026-06-01' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByText('종료일자는 필수 입력 항목입니다.')).toBeInTheDocument()
    })

    it('종료일 < 시작일 시 에러 메시지를 표시한다', () => {
      render(<TodoFormPage />)
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트' } })
      fireEvent.change(screen.getByLabelText('시작일자'), { target: { value: '2026-06-30' } })
      fireEvent.change(screen.getByLabelText('종료일자'), { target: { value: '2026-06-01' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByText('종료일자는 시작일자보다 이전일 수 없습니다.')).toBeInTheDocument()
    })

    it('유효한 폼 제출 시 createMutation.mutate를 호출한다', () => {
      render(<TodoFormPage />)
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 할일' } })
      fireEvent.change(screen.getByLabelText('시작일자'), { target: { value: '2026-06-01' } })
      fireEvent.change(screen.getByLabelText('종료일자'), { target: { value: '2026-06-30' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(mockCreate.mutate).toHaveBeenCalledWith(
        expect.objectContaining({ title: '새 할일', startDate: '2026-06-01', endDate: '2026-06-30' }),
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      )
    })

    it('성공 후 navigate("/")를 호출한다', () => {
      vi.mocked(useTodoMutationModule.useCreateTodo).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) => callbacks?.onSuccess?.()),
        isPending: false,
      } as ReturnType<typeof useTodoMutationModule.useCreateTodo>)

      render(<TodoFormPage />)
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 할일' } })
      fireEvent.change(screen.getByLabelText('시작일자'), { target: { value: '2026-06-01' } })
      fireEvent.change(screen.getByLabelText('종료일자'), { target: { value: '2026-06-30' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('서버 에러 시 에러 메시지를 표시한다', () => {
      vi.mocked(useTodoMutationModule.useCreateTodo).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) =>
          callbacks?.onError?.({
            response: { data: { code: 'INVALID_DATE_RANGE', message: '...' } },
          })
        ),
        isPending: false,
      } as ReturnType<typeof useTodoMutationModule.useCreateTodo>)

      render(<TodoFormPage />)
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 할일' } })
      fireEvent.change(screen.getByLabelText('시작일자'), { target: { value: '2026-06-01' } })
      fireEvent.change(screen.getByLabelText('종료일자'), { target: { value: '2026-06-30' } })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(screen.getByRole('alert')).toHaveTextContent('종료일은 시작일보다 이전일 수 없습니다.')
    })

    it('취소 버튼 클릭 시 navigate("/")를 호출한다', () => {
      render(<TodoFormPage />)
      fireEvent.click(screen.getByRole('button', { name: '취소' }))
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('수정 모드', () => {
    beforeEach(() => {
      setupEditMode()
    })

    it('"할일 수정" 제목을 표시한다', () => {
      render(<TodoFormPage />)
      expect(screen.getByText('할일 수정')).toBeInTheDocument()
    })

    it('기존 데이터가 폼에 채워진다', async () => {
      render(<TodoFormPage />)
      await waitFor(() => {
        expect((screen.getByLabelText('제목') as HTMLInputElement).value).toBe('기존 할일 제목')
      })
      expect((screen.getByLabelText('시작일자') as HTMLInputElement).value).toBe('2026-06-01')
      expect((screen.getByLabelText('종료일자') as HTMLInputElement).value).toBe('2026-06-30')
    })

    it('저장하기 클릭 시 updateMutation.mutate를 호출한다', async () => {
      render(<TodoFormPage />)
      await waitFor(() => {
        expect((screen.getByLabelText('제목') as HTMLInputElement).value).toBe('기존 할일 제목')
      })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(mockUpdate.mutate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'todo-1' }),
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })

    it('수정 성공 후 navigate("/")를 호출한다', async () => {
      vi.mocked(useTodoMutationModule.useUpdateTodo).mockReturnValue({
        mutate: vi.fn().mockImplementation((_, callbacks) => callbacks?.onSuccess?.()),
        isPending: false,
      } as ReturnType<typeof useTodoMutationModule.useUpdateTodo>)

      render(<TodoFormPage />)
      await waitFor(() => {
        expect((screen.getByLabelText('제목') as HTMLInputElement).value).toBe('기존 할일 제목')
      })
      fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })
})
