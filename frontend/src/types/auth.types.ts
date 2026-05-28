export interface User {
  id: string;
  email: string;
  name: string;
  language?: 'ko' | 'en' | 'ja';
  themeMode?: 'light' | 'dark';
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  name?: string;
  password?: string;
}
