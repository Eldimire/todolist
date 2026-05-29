import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useCategories } from '../hooks/useCategory';
import { useTodo } from '../hooks/useTodoList';
import { useCreateTodo, useUpdateTodo } from '../hooks/useTodoMutation';
import { parseApiError, getErrorMessage } from '../utils/errorHandler';
import { isNotEmpty, isValidDateRange } from '../utils/validation';

interface FormErrors {
  title?: string;
  startDate?: string;
  endDate?: string;
  form?: string;
}

export function TodoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: categories = [] } = useCategories();
  const { data: existingTodo } = useTodo(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEditMode && existingTodo) {
      setTitle(existingTodo.title);
      setDescription(existingTodo.description ?? '');
      setCategoryId(existingTodo.category_id);
      setStartDate(existingTodo.start_date);
      setEndDate(existingTodo.end_date);
    }
  }, [isEditMode, existingTodo]);

  useEffect(() => {
    if (!isEditMode && categories.length > 0 && !categoryId) {
      const defaultCat = categories.find((c) => c.is_default);
      if (defaultCat) setCategoryId(defaultCat.id);
    }
  }, [isEditMode, categories]);

  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!isNotEmpty(title)) newErrors.title = '제목은 필수 입력 항목입니다.';
    if (!startDate) newErrors.startDate = '시작일자는 필수 입력 항목입니다.';
    if (!endDate) newErrors.endDate = '종료일자는 필수 입력 항목입니다.';
    if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
      newErrors.endDate = '종료일자는 시작일자보다 이전일 수 없습니다.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleError(err: unknown) {
    const { code } = parseApiError(err);
    setErrors({ form: getErrorMessage(code) });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(categoryId ? { categoryId } : {}),
      startDate,
      endDate,
    };

    if (isEditMode) {
      updateMutation.mutate(
        { id: id!, data },
        { onSuccess: () => navigate('/'), onError: handleError }
      );
    } else {
      createMutation.mutate(data as Parameters<typeof createMutation.mutate>[0], {
        onSuccess: () => navigate('/'),
        onError: handleError,
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <MainLayout>
      <div className="max-w-[600px] mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          ← 목록으로
        </button>

        <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h1 className="text-lg font-bold text-[#111827] mb-6">
            {isEditMode ? '할일 수정' : '할일 등록'}
          </h1>

          {errors.form && (
            <p role="alert" className="mb-4 text-sm text-red-500">
              {errors.form}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#374151] mb-1">
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className={`w-full px-3 py-2 border rounded-[10px] text-sm text-[#111827] outline-none focus:border-[#9CA3AF] transition-colors ${
                  errors.title ? 'border-red-400' : 'border-[#E5E7EB]'
                }`}
              />
              {errors.title && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#374151] mb-1">
                설명
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] outline-none focus:border-[#9CA3AF] transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-[#374151] mb-1">
                카테고리
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] outline-none focus:border-[#9CA3AF] bg-white transition-colors"
              >
                <option value="">카테고리 선택</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-[#374151] mb-1">
                  시작일자
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-[10px] text-sm text-[#111827] outline-none focus:border-[#9CA3AF] transition-colors ${
                    errors.startDate ? 'border-red-400' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.startDate && (
                  <p role="alert" className="mt-1 text-xs text-red-500">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-[#374151] mb-1">
                  종료일자
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-[10px] text-sm text-[#111827] outline-none focus:border-[#9CA3AF] transition-colors ${
                    errors.endDate ? 'border-red-400' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.endDate && (
                  <p role="alert" className="mt-1 text-xs text-red-500">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-[10px] hover:bg-[#F8F8F8] transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-[#111827] rounded-[10px] hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
