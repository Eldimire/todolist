import { useState } from 'react';
import { useCategories, useCategoryMutation } from '../../hooks/useCategory';
import { parseApiError, getErrorMessage } from '../../utils/errorHandler';
import type { Category } from '../../types/category.types';

export function CategoryList() {
  const { data: categories = [], isLoading } = useCategories();
  const { create, update, remove } = useCategoryMutation();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    create.mutate(
      { name: newName.trim() },
      {
        onSuccess: () => setNewName(''),
        onError: (err) => {
          const { code } = parseApiError(err);
          setError(getErrorMessage(code));
        },
      }
    );
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setError(null);
    update.mutate(
      { id, data: { name: editName.trim() } },
      {
        onSuccess: () => cancelEdit(),
        onError: (err) => {
          const { code } = parseApiError(err);
          setError(getErrorMessage(code));
        },
      }
    );
  }

  function handleDelete(id: string) {
    if (
      !window.confirm('카테고리를 삭제하시겠습니까?\n하위 할일은 기본 카테고리로 이동됩니다.')
    )
      return;
    setError(null);
    remove.mutate(id, {
      onError: (err) => {
        const { code } = parseApiError(err);
        setError(getErrorMessage(code));
      },
    });
  }

  if (isLoading) {
    return <p className="text-sm text-text-secondary">카테고리를 불러오는 중...</p>;
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <ul className="space-y-2 mb-4">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center gap-2 p-3 bg-bg-base border border-[#A3BDD8] rounded-[10px]"
          >
            {editingId === category.id ? (
              <>
                <input
                  aria-label="카테고리 이름 수정"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-[#A3BDD8] rounded-[6px] outline-none focus:border-blue-400"
                />
                <button
                  onClick={() => handleUpdate(category.id)}
                  disabled={update.isPending}
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-xs text-text-secondary hover:text-text-primary"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-text-primary">{category.name}</span>
                {category.is_default && (
                  <span className="text-xs text-text-secondary bg-bg-muted px-2 py-0.5 rounded-[6px]">
                    기본
                  </span>
                )}
                {!category.is_default && (
                  <>
                    <button
                      onClick={() => startEdit(category)}
                      className="text-xs text-text-secondary hover:text-text-primary"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={remove.isPending}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          aria-label="새 카테고리 이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 카테고리 이름"
          className="flex-1 px-3 py-2 text-sm border border-[#A3BDD8] rounded-[10px] outline-none focus:border-blue-400"
        />
        <button
          type="submit"
          disabled={create.isPending || !newName.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-[#4A7AAF] rounded-[10px] hover:bg-[#3A6A9F] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          추가
        </button>
      </form>
    </div>
  );
}
