import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

/**
 * Decodes a JWT token to extract user data without a library dependency.
 * Used for restoring session on page refresh (session persistence).
 * Returns null if token is invalid or expired.
 */
const decodeToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    // Validate required fields exist
    if (!payload.userId || !payload.email) {
      return null;
    }

    return {
      id: payload.userId,
      username: payload.username || "",
      email: payload.email,
    };
  } catch {
    return null;
  }
};

export const useAuthStore = defineStore("auth", () => {
  const storedToken = localStorage.getItem("token") || null;

  // Restore user session from JWT on page refresh
  const token = ref<string | null>(storedToken);
  const user = ref<User | null>(storedToken ? decodeToken(storedToken) : null);

  // If token is expired, clear it
  if (storedToken && !user.value) {
    localStorage.removeItem("token");
    token.value = null;
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: { token: string; user: User } }>(
        "/auth/login",
        {
          email,
          password,
        }
      );
      const { token: newToken, user: userData } = response.data.data;

      token.value = newToken;
      user.value = userData;
      localStorage.setItem("token", newToken);

      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: { token: string; user: User } }>(
        "/auth/register",
        {
          username,
          email,
          password,
        }
      );
      const { token: newToken, user: userData } = response.data.data;

      token.value = newToken;
      user.value = userData;
      localStorage.setItem("token", newToken);

      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = (): void => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
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
