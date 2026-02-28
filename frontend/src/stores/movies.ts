import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

interface Movie {
  id: string;
  title: string;
  releaseDate: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  userId: string;
  reviewCount?: number;
  rank?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface MovieResponse {
  success: boolean;
  message?: string;
  data?: Movie;
}

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([]);
  const currentMovie = ref<Movie | null>(null);
  const loading = ref<boolean>(false);
  const searchQuery = ref<string>('');

  const fetchMovies = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await api.get<{ data: Movie[] }>('/movies');
      movies.value = response.data.data;
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchMovieById = async (id: string): Promise<void> => {
    loading.value = true;
    try {
      const response = await api.get<{ data: Movie }>(`/movies/${id}`);
      currentMovie.value = response.data.data;
    } catch (error) {
      console.error('Failed to fetch movie:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const searchMovies = async (query: string): Promise<void> => {
    loading.value = true;
    searchQuery.value = query;
    try {
      const response = await api.get<{ data: Movie[] }>('/movies/search', {
        params: { q: query },
      });
      movies.value = response.data.data;
    } catch (error) {
      console.error('Failed to search movies:', error);
    } finally {
      loading.value = false;
    }
  };

  const createMovie = async (movieData: Partial<Movie>): Promise<MovieResponse> => {
    try {
      const response = await api.post<{ data: Movie }>('/movies', movieData);
      await fetchMovies();
      return { success: true, data: response.data.data };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to create movie',
      };
    }
  };

  const updateMovie = async (
    id: string,
    movieData: Partial<Movie>
  ): Promise<MovieResponse> => {
    try {
      const response = await api.put<{ data: Movie }>(`/movies/${id}`, movieData);
      await fetchMovies();
      if (currentMovie.value?.id === id) {
        await fetchMovieById(id);
      }
      return { success: true, data: response.data.data };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to update movie',
      };
    }
  };

  const deleteMovie = async (id: string): Promise<MovieResponse> => {
    try {
      await api.delete(`/movies/${id}`);
      await fetchMovies();
      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to delete movie',
      };
    }
  };

  return {
    movies,
    currentMovie,
    loading,
    searchQuery,
    fetchMovies,
    fetchMovieById,
    searchMovies,
    createMovie,
    updateMovie,
    deleteMovie,
  };
});
