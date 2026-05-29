import { useToggleComplete } from '../../hooks/useTodoMutation';
import type { Todo, TodoStatus } from '../../types/todo.types';

interface TodoCardProps {
  todo: Todo;
  categoryName?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function getTodayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

function computeStatus(todo: Todo): TodoStatus {
  if (todo.is_completed) return 'completed';
  const today = getTodayKST();
  if (today < todo.start_date) return 'not_started';
  if (today > todo.end_date) return 'overdue';
  return 'in_progress';
}

const STATUS_CONFIG: Record<TodoStatus, { label: string; bg: string; text: string; dot: string }> = {
  not_started: { label: '시작 전', bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  in_progress: { label: '진행 중', bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  completed: { label: '완료', bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
  overdue: { label: '기한 초과', bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
};

export function TodoCard({ todo, categoryName, onEdit, onDelete }: TodoCardProps) {
  const toggleMutation = useToggleComplete();
  const status = computeStatus(todo);
  const statusConfig = STATUS_CONFIG[status];

  function handleDelete() {
    if (!window.confirm('할일을 삭제하시겠습니까?')) return;
    onDelete(todo.id);
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:border-[#9CA3AF] transition-all">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.is_completed}
          disabled={toggleMutation.isPending}
          onChange={() => toggleMutation.mutate(todo.id)}
          className="mt-0.5 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[#111827] truncate">{todo.title}</span>
            <span
              className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-[9999px]"
              style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusConfig.dot }}
              />
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            {categoryName && (
              <span className="bg-[#F3F4F6] px-2 py-0.5 rounded-[6px]">{categoryName}</span>
            )}
            <span>{todo.start_date} ~ {todo.end_date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(todo.id)}
            className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
