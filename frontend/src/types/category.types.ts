export interface Category {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}
