import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('User Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            token: 'test-token-123',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
            },
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const authStore = useAuthStore();

      // Initially not authenticated
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBe(null);

      // Register user
      const result = await authStore.register('testuser', 'test@example.com', 'password123');

      // Should be successful
      expect(result.success).toBe(true);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(authStore.token).toBe('test-token-123');
      expect(localStorage.getItem('token')).toBe('test-token-123');

      // Verify API was called correctly
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle registration failure', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Email already exists',
          },
        },
      };

      api.post.mockRejectedValue(mockError);

      const authStore = useAuthStore();
      const result = await authStore.register('testuser', 'test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already exists');
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBe(null);
    });
  });

  describe('User Login Flow', () => {
    it('should login user successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            token: 'login-token-456',
            user: {
              id: 'user-2',
              username: 'existinguser',
              email: 'existing@example.com',
            },
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const authStore = useAuthStore();

      // Initially not authenticated
      expect(authStore.isAuthenticated).toBe(false);

      // Login user
      const result = await authStore.login('existing@example.com', 'password123');

      // Should be successful
      expect(result.success).toBe(true);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user.email).toBe('existing@example.com');
      expect(authStore.token).toBe('login-token-456');
      expect(localStorage.getItem('token')).toBe('login-token-456');

      // Verify API was called correctly
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'existing@example.com',
        password: 'password123',
      });
    });

    it('should handle login failure with invalid credentials', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      api.post.mockRejectedValue(mockError);

      const authStore = useAuthStore();
      const result = await authStore.login('wrong@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('User Logout Flow', () => {
    it('should logout user and clear session', async () => {
      // First, login user
      const mockLoginResponse = {
        data: {
          data: {
            token: 'test-token',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
            },
          },
        },
      };

      api.post.mockResolvedValue(mockLoginResponse);

      const authStore = useAuthStore();
      await authStore.login('test@example.com', 'password123');

      // Verify user is logged in
      expect(authStore.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe('test-token');

      // Logout user
      authStore.logout();

      // Verify user is logged out
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBe(null);
      expect(authStore.token).toBe(null);
      expect(localStorage.getItem('token')).toBe(null);
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full flow: register → login → logout', async () => {
      const mockRegisterResponse = {
        data: {
          data: {
            token: 'register-token',
            user: {
              id: 'user-1',
              username: 'newuser',
              email: 'newuser@example.com',
            },
          },
        },
      };

      const mockLoginResponse = {
        data: {
          data: {
            token: 'login-token',
            user: {
              id: 'user-1',
              username: 'newuser',
              email: 'newuser@example.com',
            },
          },
        },
      };

      const authStore = useAuthStore();

      // Step 1: Register
      api.post.mockResolvedValueOnce(mockRegisterResponse);
      const registerResult = await authStore.register('newuser', 'newuser@example.com', 'password123');
      expect(registerResult.success).toBe(true);
      expect(authStore.isAuthenticated).toBe(true);

      // Step 2: Logout
      authStore.logout();
      expect(authStore.isAuthenticated).toBe(false);

      // Step 3: Login again
      api.post.mockResolvedValueOnce(mockLoginResponse);
      const loginResult = await authStore.login('newuser@example.com', 'password123');
      expect(loginResult.success).toBe(true);
      expect(authStore.isAuthenticated).toBe(true);

      // Step 4: Logout again
      authStore.logout();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });
});
