import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo, updateTodo, deleteTodo, toggleComplete } from '../api/todoClient';
import { todoKeys } from '../constants/queryKeys';
import type { CreateTodoRequest, UpdateTodoRequest } from '../types/todo.types';

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoRequest) => createTodo(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) => updateTodo(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  });
}

export function useToggleComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleComplete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  });
}
