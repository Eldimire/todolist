export const QUERY_KEYS = {
  TODOS: 'todos',
  CATEGORIES: 'categories',
  USER: 'user',
} as const;

export const todoKeys = {
  all: [QUERY_KEYS.TODOS] as const,
  filtered: (params: Record<string, unknown>) => [QUERY_KEYS.TODOS, params] as const,
};

export const categoryKeys = {
  all: [QUERY_KEYS.CATEGORIES] as const,
};
