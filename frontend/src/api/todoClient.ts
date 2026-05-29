import apiClient from './client';
import { ENDPOINTS } from '../constants/api';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, GetTodosParams } from '../types/todo.types';

export async function getTodo(id: string): Promise<{ todo: Todo }> {
  const response = await apiClient.get<{ todo: Todo }>(ENDPOINTS.TODOS.BY_ID(id));
  return response.data;
}

export async function getTodos(params?: GetTodosParams): Promise<{ todos: Todo[] }> {
  const response = await apiClient.get<{ todos: Todo[] }>(ENDPOINTS.TODOS.BASE, { params });
  return response.data;
}

export async function createTodo(data: CreateTodoRequest): Promise<{ todo: Todo }> {
  const response = await apiClient.post<{ todo: Todo }>(ENDPOINTS.TODOS.BASE, data);
  return response.data;
}

export async function updateTodo(id: string, data: UpdateTodoRequest): Promise<{ todo: Todo }> {
  const response = await apiClient.patch<{ todo: Todo }>(ENDPOINTS.TODOS.BY_ID(id), data);
  return response.data;
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.TODOS.BY_ID(id));
}

export async function toggleComplete(id: string): Promise<{ todo: Todo }> {
  const response = await apiClient.patch<{ todo: Todo }>(ENDPOINTS.TODOS.COMPLETE(id));
  return response.data;
}
