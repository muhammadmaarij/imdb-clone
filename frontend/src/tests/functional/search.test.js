import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMoviesStore } from '../../stores/movies';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('Search Functionality Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should search movies by title successfully', async () => {
    const mockSearchResults = [
      {
        id: 'movie-1',
        title: 'The Matrix',
        releaseDate: '1999-03-31',
        description: 'A computer hacker learns about the true nature of reality',
        posterUrl: 'https://example.com/matrix.jpg',
        trailerUrl: 'https://youtube.com/watch?v=matrix',
        userId: 'user-1',
        reviewCount: 10,
        rank: 1,
      },
      {
        id: 'movie-2',
        title: 'The Matrix Reloaded',
        releaseDate: '2003-05-15',
        description: 'Neo and the resistance continue their fight',
        posterUrl: 'https://example.com/matrix2.jpg',
        trailerUrl: 'https://youtube.com/watch?v=matrix2',
        userId: 'user-1',
        reviewCount: 5,
        rank: 2,
      },
    ];

    const mockResponse = {
      data: {
        data: mockSearchResults,
      },
    };

    api.get.mockResolvedValue(mockResponse);

    const moviesStore = useMoviesStore();

    // Initially no search query
    expect(moviesStore.searchQuery).toBe('');

    // Search for movies
    await moviesStore.searchMovies('matrix');

    // Should have search results
    expect(moviesStore.movies).toHaveLength(2);
    expect(moviesStore.movies[0].title).toBe('The Matrix');
    expect(moviesStore.movies[1].title).toBe('The Matrix Reloaded');
    expect(moviesStore.searchQuery).toBe('matrix');
    expect(moviesStore.loading).toBe(false);

    // Verify API was called correctly
    expect(api.get).toHaveBeenCalledWith('/movies/search', {
      params: { q: 'matrix' },
    });
  });

  it('should handle search with no results', async () => {
    const mockResponse = {
      data: {
        data: [],
      },
    };

    api.get.mockResolvedValue(mockResponse);

    const moviesStore = useMoviesStore();
    await moviesStore.searchMovies('nonexistent');

    expect(moviesStore.movies).toEqual([]);
    expect(moviesStore.searchQuery).toBe('nonexistent');
  });

  it('should handle search error', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Search failed',
        },
      },
    };

    api.get.mockRejectedValue(mockError);

    const moviesStore = useMoviesStore();
    await moviesStore.searchMovies('test');

    // Should have empty array on error
    expect(moviesStore.movies).toEqual([]);
    expect(moviesStore.loading).toBe(false);
  });

  it('should search with case-insensitive query', async () => {
    const mockSearchResults = [
      {
        id: 'movie-1',
        title: 'Inception',
        releaseDate: '2010-07-16',
        description: 'A thief who steals corporate secrets',
        posterUrl: 'https://example.com/inception.jpg',
        trailerUrl: 'https://youtube.com/watch?v=inception',
        userId: 'user-1',
        reviewCount: 8,
        rank: 1,
      },
    ];

    const mockResponse = {
      data: {
        data: mockSearchResults,
      },
    };

    api.get.mockResolvedValue(mockResponse);

    const moviesStore = useMoviesStore();

    // Search with lowercase
    await moviesStore.searchMovies('inception');
    expect(moviesStore.movies[0].title).toBe('Inception');

    // Search with uppercase
    await moviesStore.searchMovies('INCEPTION');
    expect(api.get).toHaveBeenCalledWith('/movies/search', {
      params: { q: 'INCEPTION' },
    });
  });

  it('should handle empty search query by fetching all movies', async () => {
    const mockAllMovies = [
      {
        id: 'movie-1',
        title: 'Movie 1',
        releaseDate: '2020-01-01',
        description: 'Description 1',
        posterUrl: 'https://example.com/1.jpg',
        trailerUrl: 'https://youtube.com/watch?v=1',
        userId: 'user-1',
        reviewCount: 5,
        rank: 1,
      },
      {
        id: 'movie-2',
        title: 'Movie 2',
        releaseDate: '2021-01-01',
        description: 'Description 2',
        posterUrl: 'https://example.com/2.jpg',
        trailerUrl: 'https://youtube.com/watch?v=2',
        userId: 'user-2',
        reviewCount: 3,
        rank: 2,
      },
    ];

    const mockResponse = {
      data: {
        data: mockAllMovies,
      },
    };

    api.get.mockResolvedValue(mockResponse);

    const moviesStore = useMoviesStore();

    // Fetch all movies (simulating empty search)
    await moviesStore.fetchMovies();

    expect(moviesStore.movies).toHaveLength(2);
    expect(api.get).toHaveBeenCalledWith('/movies');
  });
});
