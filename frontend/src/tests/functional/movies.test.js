import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useMoviesStore } from "../../stores/movies";
import { useAuthStore } from "../../stores/auth";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
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

describe("Movie Management Flow", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Fetch Movies Flow", () => {
    it("should fetch all movies successfully", async () => {
      const mockMovies = [
        {
          id: "movie-1",
          title: "The Matrix",
          releaseDate: "1999-03-31",
          description:
            "A computer hacker learns about the true nature of reality",
          posterUrl: "https://example.com/matrix.jpg",
          trailerUrl: "https://youtube.com/watch?v=matrix",
          userId: "user-1",
          reviewCount: 10,
          rank: 1,
        },
        {
          id: "movie-2",
          title: "Inception",
          releaseDate: "2010-07-16",
          description: "A thief who steals corporate secrets",
          posterUrl: "https://example.com/inception.jpg",
          trailerUrl: "https://youtube.com/watch?v=inception",
          userId: "user-2",
          reviewCount: 8,
          rank: 2,
        },
      ];

      const mockResponse = {
        data: {
          data: mockMovies,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const moviesStore = useMoviesStore();

      // Initially no movies
      expect(moviesStore.movies).toEqual([]);
      expect(moviesStore.loading).toBe(false);

      // Fetch movies
      await moviesStore.fetchMovies();

      // Should have movies
      expect(moviesStore.movies).toHaveLength(2);
      expect(moviesStore.movies[0].title).toBe("The Matrix");
      expect(moviesStore.movies[1].title).toBe("Inception");
      expect(moviesStore.loading).toBe(false);

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith("/movies");
    });

    it("should handle fetch movies error", async () => {
      const mockError = {
        response: {
          data: {
            message: "Failed to fetch movies",
          },
        },
      };

      api.get.mockRejectedValue(mockError);

      const moviesStore = useMoviesStore();
      await moviesStore.fetchMovies();

      // Should still have empty array on error
      expect(moviesStore.movies).toEqual([]);
      expect(moviesStore.loading).toBe(false);
    });
  });

  describe("Create Movie Flow", () => {
    it("should create a movie successfully", async () => {
      // Setup authenticated user
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      };
      localStorage.setItem("token", "test-token");

      const newMovie = {
        id: "movie-new",
        title: "New Movie",
        releaseDate: "2024-01-01",
        description: "A new movie",
        posterUrl: "https://example.com/new.jpg",
        trailerUrl: "https://youtube.com/watch?v=new",
        userId: "user-1",
      };

      const mockCreateResponse = {
        data: {
          data: newMovie,
        },
      };

      const mockFetchResponse = {
        data: {
          data: [newMovie],
        },
      };

      api.post.mockResolvedValueOnce(mockCreateResponse);
      api.get.mockResolvedValueOnce(mockFetchResponse);

      const moviesStore = useMoviesStore();

      const result = await moviesStore.createMovie({
        title: "New Movie",
        releaseDate: "2024-01-01",
        description: "A new movie",
        posterUrl: "https://example.com/new.jpg",
        trailerUrl: "https://youtube.com/watch?v=new",
      });

      expect(result.success).toBe(true);
      expect(result.data.title).toBe("New Movie");

      // Verify API was called correctly
      expect(api.post).toHaveBeenCalledWith("/movies", {
        title: "New Movie",
        releaseDate: "2024-01-01",
        description: "A new movie",
        posterUrl: "https://example.com/new.jpg",
        trailerUrl: "https://youtube.com/watch?v=new",
      });

      // Verify movies were refetched
      expect(api.get).toHaveBeenCalledWith("/movies");
    });

    it("should handle create movie failure (duplicate title)", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const mockError = {
        response: {
          data: {
            message: "Movie with this title already exists",
          },
        },
      };

      api.post.mockRejectedValue(mockError);

      const moviesStore = useMoviesStore();
      const result = await moviesStore.createMovie({
        title: "Existing Movie",
        releaseDate: "2024-01-01",
        description: "Description",
        posterUrl: "https://example.com/poster.jpg",
        trailerUrl: "https://youtube.com/watch?v=test",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Movie with this title already exists");
    });
  });

  describe("Update Movie Flow", () => {
    it("should update a movie successfully", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const existingMovie = {
        id: "movie-1",
        title: "Original Title",
        releaseDate: "2020-01-01",
        description: "Original description",
        posterUrl: "https://example.com/original.jpg",
        trailerUrl: "https://youtube.com/watch?v=original",
        userId: "user-1",
      };

      const updatedMovie = {
        ...existingMovie,
        title: "Updated Title",
        releaseDate: "2021-01-01",
        description: "Updated description",
      };

      const mockUpdateResponse = {
        data: {
          data: updatedMovie,
        },
      };

      const mockFetchAllResponse = {
        data: {
          data: [updatedMovie],
        },
      };

      const mockFetchByIdResponse = {
        data: {
          data: updatedMovie,
        },
      };

      api.put.mockResolvedValueOnce(mockUpdateResponse);
      api.get.mockResolvedValueOnce(mockFetchAllResponse); // For fetchMovies()
      api.get.mockResolvedValueOnce(mockFetchByIdResponse); // For fetchMovieById()

      const moviesStore = useMoviesStore();
      moviesStore.currentMovie = existingMovie;

      const result = await moviesStore.updateMovie("movie-1", {
        title: "Updated Title",
        releaseDate: "2021-01-01",
        description: "Updated description",
      });

      expect(result.success).toBe(true);
      expect(result.data.title).toBe("Updated Title");

      // Verify API was called correctly
      expect(api.put).toHaveBeenCalledWith("/movies/movie-1", {
        title: "Updated Title",
        releaseDate: "2021-01-01",
        description: "Updated description",
      });
    });
  });

  describe("Delete Movie Flow", () => {
    it("should delete a movie successfully", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const mockDeleteResponse = { status: 200 };
      const mockFetchResponse = {
        data: {
          data: [],
        },
      };

      api.delete.mockResolvedValueOnce(mockDeleteResponse);
      api.get.mockResolvedValueOnce(mockFetchResponse);

      const moviesStore = useMoviesStore();
      moviesStore.movies = [
        {
          id: "movie-1",
          title: "Movie to Delete",
          releaseDate: "2020-01-01",
          description: "Description",
          posterUrl: "https://example.com/poster.jpg",
          trailerUrl: "https://youtube.com/watch?v=test",
          userId: "user-1",
        },
      ];

      const result = await moviesStore.deleteMovie("movie-1");

      expect(result.success).toBe(true);

      // Verify API was called correctly
      expect(api.delete).toHaveBeenCalledWith("/movies/movie-1");

      // Verify movies were refetched
      expect(api.get).toHaveBeenCalledWith("/movies");
    });
  });

  describe("Complete Movie Management Flow", () => {
    it("should complete full flow: create → fetch → update → delete", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const moviesStore = useMoviesStore();

      // Step 1: Create movie
      const newMovie = {
        id: "movie-flow",
        title: "Flow Movie",
        releaseDate: "2024-01-01",
        description: "A movie for testing flow",
        posterUrl: "https://example.com/flow.jpg",
        trailerUrl: "https://youtube.com/watch?v=flow",
        userId: "user-1",
      };

      api.post.mockResolvedValueOnce({ data: { data: newMovie } });
      api.get.mockResolvedValueOnce({ data: { data: [newMovie] } });

      const createResult = await moviesStore.createMovie({
        title: "Flow Movie",
        releaseDate: "2024-01-01",
        description: "A movie for testing flow",
        posterUrl: "https://example.com/flow.jpg",
        trailerUrl: "https://youtube.com/watch?v=flow",
      });

      expect(createResult.success).toBe(true);

      // Step 2: Fetch movie by ID
      api.get.mockResolvedValueOnce({ data: { data: newMovie } });
      await moviesStore.fetchMovieById("movie-flow");
      expect(moviesStore.currentMovie.title).toBe("Flow Movie");

      // Step 3: Update movie
      const updatedMovie = { ...newMovie, title: "Updated Flow Movie" };
      api.put.mockResolvedValueOnce({ data: { data: updatedMovie } });
      api.get.mockResolvedValueOnce({ data: { data: [updatedMovie] } });
      api.get.mockResolvedValueOnce({ data: { data: updatedMovie } });

      const updateResult = await moviesStore.updateMovie("movie-flow", {
        title: "Updated Flow Movie",
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data.title).toBe("Updated Flow Movie");

      // Step 4: Delete movie
      api.delete.mockResolvedValueOnce({ status: 200 });
      api.get.mockResolvedValueOnce({ data: { data: [] } });

      const deleteResult = await moviesStore.deleteMovie("movie-flow");
      expect(deleteResult.success).toBe(true);
    });
  });
});
