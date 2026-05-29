import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryClient';
import { categoryKeys } from '../constants/queryKeys';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types';

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const result = await getCategories();
      return result.categories;
    },
  });
}

export function useCategoryMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: categoryKeys.all });

  const create = useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      updateCategory(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
