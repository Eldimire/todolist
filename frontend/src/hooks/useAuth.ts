import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login, signup, logout, updateProfile } from '../api/authClient';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, SignupRequest, UpdateProfileRequest } from '../types/auth.types';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/');
    },
  });
}

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: () => {
      navigate('/login');
    },
  });
}

export function useUpdateProfile() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (data) => {
      if (token) setAuth(data.user, token);
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      navigate('/login');
    },
  });
}
