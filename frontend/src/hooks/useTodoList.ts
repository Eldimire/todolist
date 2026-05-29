import { useQuery } from '@tanstack/react-query';
import { getTodo, getTodos } from '../api/todoClient';
import { todoKeys } from '../constants/queryKeys';
import type { GetTodosParams } from '../types/todo.types';

export function useTodo(id: string | undefined) {
  return useQuery({
    queryKey: id ? [...todoKeys.all, id] : todoKeys.all,
    queryFn: async () => {
      const result = await getTodo(id!);
      return result.todo;
    },
    enabled: !!id,
  });
}

export function useTodos(params?: GetTodosParams) {
  return useQuery({
    queryKey: params ? todoKeys.filtered(params as Record<string, unknown>) : todoKeys.all,
    queryFn: async () => {
      const result = await getTodos(params);
      return result.todos;
    },
  });
}
