import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { TodoCard } from '../components/todo/TodoCard';
import { useTodos } from '../hooks/useTodoList';
import { useCategories } from '../hooks/useCategory';
import { useDeleteTodo } from '../hooks/useTodoMutation';
import { useUiStore } from '../stores/uiStore';
import type { ActiveFilter } from '../stores/uiStore';
import type { GetTodosParams, TodoStatus } from '../types/todo.types';

const FILTER_TABS: { key: ActiveFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'category', label: '카테고리' },
  { key: 'not_started', label: '시작 전' },
  { key: 'in_progress', label: '진행 중' },
  { key: 'completed', label: '완료' },
  { key: 'overdue', label: '기한 초과' },
];

function buildParams(
  activeFilter: ActiveFilter,
  selectedCategoryId: string | null
): GetTodosParams | undefined {
  if (activeFilter === 'all') return undefined;
  if (activeFilter === 'category') {
    return selectedCategoryId ? { categoryId: selectedCategoryId } : undefined;
  }
  return { status: activeFilter as TodoStatus };
}

export function TodoListPage() {
  const navigate = useNavigate();
  const { activeFilter, selectedCategoryId, setFilter, setCategory } = useUiStore();
  const { data: categories = [] } = useCategories();
  const deleteTodoMutation = useDeleteTodo();
  const { data: todos = [], isLoading, isError } = useTodos(buildParams(activeFilter, selectedCategoryId));

  function handleFilterClick(filter: ActiveFilter) {
    setFilter(filter);
    if (filter !== 'category') setCategory(null);
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-bg-subtle rounded-[10px] overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterClick(tab.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-[6px] text-sm font-medium transition-colors ${
                activeFilter === tab.key
                  ? 'bg-bg-base text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeFilter === 'category' && (
          <div className="mt-2">
            <select
              aria-label="카테고리 선택"
              value={selectedCategoryId ?? ''}
              onChange={(e) => setCategory(e.target.value || null)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-[#A3BDD8] rounded-[10px] outline-none focus:border-[#9CA3AF] bg-bg-base text-text-primary"
            >
              <option value="">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/todos/new')}
          className="px-4 py-2 text-sm font-medium text-white bg-[#4A7AAF] rounded-[10px] hover:bg-[#3A6A9F] transition-colors"
        >
          + 할일 추가
        </button>
      </div>

      {isError ? (
        <p role="alert" className="text-sm text-red-500 text-center py-8">
          할일을 불러오는 중 오류가 발생했습니다.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-text-secondary text-center py-8">할일을 불러오는 중...</p>
      ) : todos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-text-secondary">할일이 없습니다.</p>
          <button
            onClick={() => navigate('/todos/new')}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            새 할일 추가하기
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {todos.map((todo) => {
            const category = categories.find((c) => c.id === todo.category_id);
            return (
              <TodoCard
                key={todo.id}
                todo={todo}
                categoryName={category?.name}
                onEdit={(id) => navigate(`/todos/${id}/edit`)}
                onDelete={(id) => deleteTodoMutation.mutate(id)}
              />
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
