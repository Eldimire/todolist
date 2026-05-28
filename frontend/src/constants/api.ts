export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    ME: '/users/me',
    LANGUAGE: '/users/me/language',
    THEME: '/users/me/theme',
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },
  TODOS: {
    BASE: '/todos',
    BY_ID: (id: string) => `/todos/${id}`,
    COMPLETE: (id: string) => `/todos/${id}/complete`,
  },
} as const;
