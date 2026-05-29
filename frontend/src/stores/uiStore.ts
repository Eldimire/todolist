import { create } from 'zustand';
import type { TodoStatus } from '../types/todo.types';

export type ActiveFilter = 'all' | 'category' | TodoStatus;

interface UiState {
  activeFilter: ActiveFilter;
  selectedCategoryId: string | null;
  setFilter: (filter: ActiveFilter) => void;
  setCategory: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeFilter: 'all',
  selectedCategoryId: null,
  setFilter: (filter) => set({ activeFilter: filter }),
  setCategory: (id) => set({ selectedCategoryId: id }),
}));
