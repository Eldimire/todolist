import apiClient from './client';
import { ENDPOINTS } from '../constants/api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types';

export async function getCategories(): Promise<{ categories: Category[] }> {
  const response = await apiClient.get<{ categories: Category[] }>(ENDPOINTS.CATEGORIES.BASE);
  return response.data;
}

export async function createCategory(data: CreateCategoryRequest): Promise<{ category: Category }> {
  const response = await apiClient.post<{ category: Category }>(ENDPOINTS.CATEGORIES.BASE, data);
  return response.data;
}

export async function updateCategory(id: string, data: UpdateCategoryRequest): Promise<{ category: Category }> {
  const response = await apiClient.patch<{ category: Category }>(ENDPOINTS.CATEGORIES.BY_ID(id), data);
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.CATEGORIES.BY_ID(id));
}
