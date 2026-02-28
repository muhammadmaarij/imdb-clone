import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token') || null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: { token: string; user: User } }>('/auth/login', {
        email,
        password,
      });
      const { token: newToken, user: userData } = response.data.data;

      token.value = newToken;
      user.value = userData;
      localStorage.setItem('token', newToken);

      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: { token: string; user: User } }>('/auth/register', {
        username,
        email,
        password,
      });
      const { token: newToken, user: userData } = response.data.data;

      token.value = newToken;
      user.value = userData;
      localStorage.setItem('token', newToken);

      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = (): void => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
  };
});
