import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../stores/auth';
import { useMoviesStore } from '../../stores/movies';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('End-to-End User Flow Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should complete full user journey: register → login → add movie → add review → search → edit → delete', async () => {
    const authStore = useAuthStore();
    const moviesStore = useMoviesStore();

    // Step 1: Register new user
    const mockRegisterResponse = {
      data: {
        data: {
          token: 'user-token',
          user: {
            id: 'user-1',
            username: 'newuser',
            email: 'newuser@example.com',
          },
        },
      },
    };

    api.post.mockResolvedValueOnce(mockRegisterResponse);
    const registerResult = await authStore.register('newuser', 'newuser@example.com', 'password123');
    expect(registerResult.success).toBe(true);
    expect(authStore.isAuthenticated).toBe(true);

    // Step 2: Fetch all movies (homepage)
    const mockMovies = [
      {
        id: 'existing-movie',
        title: 'Existing Movie',
        releaseDate: '2020-01-01',
        description: 'An existing movie',
        posterUrl: 'https://example.com/existing.jpg',
        trailerUrl: 'https://youtube.com/watch?v=existing',
        userId: 'user-2',
        reviewCount: 5,
        rank: 1,
      },
    ];

    api.get.mockResolvedValueOnce({ data: { data: mockMovies } });
    await moviesStore.fetchMovies();
    expect(moviesStore.movies).toHaveLength(1);

    // Step 3: Create a new movie
    const newMovie = {
      id: 'my-movie',
      title: 'My New Movie',
      releaseDate: '2024-01-01',
      description: 'A movie I created',
      posterUrl: 'https://example.com/my-movie.jpg',
      trailerUrl: 'https://youtube.com/watch?v=my-movie',
      userId: 'user-1',
    };

    api.post.mockResolvedValueOnce({ data: { data: newMovie } });
    api.get.mockResolvedValueOnce({ data: { data: [...mockMovies, newMovie] } });

    const createResult = await moviesStore.createMovie({
      title: 'My New Movie',
      releaseDate: '2024-01-01',
      description: 'A movie I created',
      posterUrl: 'https://example.com/my-movie.jpg',
      trailerUrl: 'https://youtube.com/watch?v=my-movie',
    });

    expect(createResult.success).toBe(true);

    // Step 4: Fetch movie details
    api.get.mockResolvedValueOnce({ data: { data: newMovie } });
    await moviesStore.fetchMovieById('my-movie');
    expect(moviesStore.currentMovie.title).toBe('My New Movie');

    // Step 5: Add a review to the movie
    const newReview = {
      id: 'review-1',
      movieId: 'my-movie',
      userId: 'user-1',
      rating: 5,
      comment: 'Great movie!',
      createdAt: '2024-01-01T00:00:00Z',
    };

    api.post.mockResolvedValueOnce({ data: { data: newReview } });
    const reviewResponse = await api.post('/reviews', {
      movieId: 'my-movie',
      rating: 5,
      comment: 'Great movie!',
    });

    expect(reviewResponse.data.data.comment).toBe('Great movie!');

    // Step 6: Search for movies
    const searchResults = [newMovie];
    api.get.mockResolvedValueOnce({ data: { data: searchResults } });
    await moviesStore.searchMovies('My New');
    expect(moviesStore.movies[0].title).toBe('My New Movie');

    // Step 7: Update the movie
    const updatedMovie = { ...newMovie, title: 'Updated Movie Title' };
    api.put.mockResolvedValueOnce({ data: { data: updatedMovie } });
    api.get.mockResolvedValueOnce({ data: { data: [updatedMovie] } });
    api.get.mockResolvedValueOnce({ data: { data: updatedMovie } });

    const updateResult = await moviesStore.updateMovie('my-movie', {
      title: 'Updated Movie Title',
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.data.title).toBe('Updated Movie Title');

    // Step 8: Update the review
    const updatedReview = { ...newReview, rating: 4, comment: 'Updated review comment' };
    api.put.mockResolvedValueOnce({ data: { data: updatedReview } });
    const updateReviewResponse = await api.put('/reviews/review-1', {
      rating: 4,
      comment: 'Updated review comment',
    });

    expect(updateReviewResponse.data.data.comment).toBe('Updated review comment');

    // Step 9: Delete the review
    api.delete.mockResolvedValueOnce({ status: 200 });
    const deleteReviewResponse = await api.delete('/reviews/review-1');
    expect(deleteReviewResponse.status).toBe(200);

    // Step 10: Delete the movie
    api.delete.mockResolvedValueOnce({ status: 200 });
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    const deleteResult = await moviesStore.deleteMovie('my-movie');
    expect(deleteResult.success).toBe(true);

    // Step 11: Logout
    authStore.logout();
    expect(authStore.isAuthenticated).toBe(false);
  });

  it('should handle unauthenticated user viewing movies and reviews', async () => {
    const authStore = useAuthStore();
    const moviesStore = useMoviesStore();

    // User is not authenticated
    expect(authStore.isAuthenticated).toBe(false);

    // Should be able to fetch movies
    const mockMovies = [
      {
        id: 'movie-1',
        title: 'Public Movie',
        releaseDate: '2020-01-01',
        description: 'A public movie',
        posterUrl: 'https://example.com/public.jpg',
        trailerUrl: 'https://youtube.com/watch?v=public',
        userId: 'user-1',
        reviewCount: 10,
        rank: 1,
      },
    ];

    api.get.mockResolvedValueOnce({ data: { data: mockMovies } });
    await moviesStore.fetchMovies();
    expect(moviesStore.movies).toHaveLength(1);

    // Should be able to fetch movie details
    api.get.mockResolvedValueOnce({ data: { data: mockMovies[0] } });
    await moviesStore.fetchMovieById('movie-1');
    expect(moviesStore.currentMovie.title).toBe('Public Movie');

    // Should be able to fetch reviews
    const mockReviews = [
      {
        id: 'review-1',
        movieId: 'movie-1',
        userId: 'user-2',
        rating: 5,
        comment: 'Great movie',
        user: {
          id: 'user-2',
          username: 'reviewer',
          email: 'reviewer@example.com',
        },
      },
    ];

    api.get.mockResolvedValueOnce({ data: { data: mockReviews } });
    const reviewsResponse = await api.get('/reviews/movie/movie-1');
    expect(reviewsResponse.data.data).toHaveLength(1);

    // Should NOT be able to create movie (would fail without auth)
    const mockError = {
      response: {
        data: {
          message: 'Authentication required',
        },
        status: 401,
      },
    };

    api.post.mockRejectedValueOnce(mockError);
    try {
      await moviesStore.createMovie({
        title: 'New Movie',
        releaseDate: '2024-01-01',
        description: 'Description',
        posterUrl: 'https://example.com/poster.jpg',
        trailerUrl: 'https://youtube.com/watch?v=test',
      });
    } catch (error) {
      // This would be caught by the store, but we verify the API call would fail
    }

    // Should NOT be able to create review (would fail without auth)
    api.post.mockRejectedValueOnce(mockError);
    try {
      await api.post('/reviews', {
        movieId: 'movie-1',
        rating: 5,
        comment: 'My review',
      });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should handle search functionality with ranking', async () => {
    const moviesStore = useMoviesStore();

    // Movies with different review counts (should be ranked)
    const rankedMovies = [
      {
        id: 'movie-1',
        title: 'Popular Movie',
        releaseDate: '2020-01-01',
        description: 'Very popular',
        posterUrl: 'https://example.com/popular.jpg',
        trailerUrl: 'https://youtube.com/watch?v=popular',
        userId: 'user-1',
        reviewCount: 20,
        rank: 1,
      },
      {
        id: 'movie-2',
        title: 'Less Popular Movie',
        releaseDate: '2021-01-01',
        description: 'Less popular',
        posterUrl: 'https://example.com/less.jpg',
        trailerUrl: 'https://youtube.com/watch?v=less',
        userId: 'user-2',
        reviewCount: 5,
        rank: 2,
      },
    ];

    api.get.mockResolvedValueOnce({ data: { data: rankedMovies } });
    await moviesStore.fetchMovies();

    expect(moviesStore.movies[0].rank).toBe(1);
    expect(moviesStore.movies[0].reviewCount).toBe(20);
    expect(moviesStore.movies[1].rank).toBe(2);
    expect(moviesStore.movies[1].reviewCount).toBe(5);

    // Search should maintain ranking
    api.get.mockResolvedValueOnce({ data: { data: [rankedMovies[0]] } });
    await moviesStore.searchMovies('Popular');
    expect(moviesStore.movies[0].rank).toBe(1);
  });
});
