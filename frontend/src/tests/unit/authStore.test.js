import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with no user', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBe(null);
  });

  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        data: {
          token: 'test-token',
          user: { id: '1', username: 'test', email: 'test@example.com' },
        },
      },
    };

    api.post.mockResolvedValue(mockResponse);

    const store = useAuthStore();
    const result = await store.login('test@example.com', 'password');

    expect(result.success).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.user.email).toBe('test@example.com');
  });

  it('should logout', () => {
    const store = useAuthStore();
    store.token = 'test-token';
    store.user = { id: '1', username: 'test', email: 'test@example.com' };
    localStorage.setItem('token', 'test-token');

    store.logout();

    expect(store.token).toBe(null);
    expect(store.user).toBe(null);
    expect(localStorage.getItem('token')).toBe(null);
  });
});
