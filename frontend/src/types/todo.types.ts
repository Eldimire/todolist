export type TodoStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface Todo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  categoryId?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetTodosParams {
  categoryId?: string;
  status?: TodoStatus;
}
