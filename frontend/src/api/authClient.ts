import apiClient from './client';
import { ENDPOINTS } from '../constants/api';
import type { SignupRequest, LoginRequest, LoginResponse, UpdateProfileRequest, User } from '../types/auth.types';

export async function signup(data: SignupRequest): Promise<{ user: Pick<User, 'id' | 'email' | 'name'> }> {
  const response = await apiClient.post(ENDPOINTS.AUTH.SIGNUP, data);
  return response.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
}

export async function updateProfile(data: UpdateProfileRequest): Promise<{ user: User }> {
  const response = await apiClient.patch<{ user: User }>(ENDPOINTS.USERS.ME, data);
  return response.data;
}

export async function updateLanguage(language: 'ko' | 'en' | 'ja'): Promise<{ user: User }> {
  const response = await apiClient.patch<{ user: User }>(ENDPOINTS.USERS.LANGUAGE, { language });
  return response.data;
}

export async function updateTheme(themeMode: 'light' | 'dark'): Promise<{ user: User }> {
  const response = await apiClient.patch<{ user: User }>(ENDPOINTS.USERS.THEME, { themeMode });
  return response.data;
}
