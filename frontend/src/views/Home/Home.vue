<template>
  <div class="home container">
    <div class="header-section">
      <h1 class="page-title">Movie Collection</h1>
      <SearchBar />
      <Button
        v-if="authStore.isAuthenticated"
        @click="showAddModal = true"
        label="+ Add Movie"
      />
    </div>

    <div v-if="moviesStore.loading" class="loading-state">Loading movies...</div>

    <div v-else-if="moviesStore.movies.length === 0" class="empty-state">
      <p>No movies found. {{ authStore.isAuthenticated ? 'Add your first movie!' : 'Register to add movies.' }}</p>
    </div>

    <div v-else class="movies-grid grid grid-responsive">
      <MovieCard
        v-for="movie in moviesStore.movies"
        :key="movie.id"
        :movie="movie"
      />
    </div>

    <MovieModal
      :show="showAddModal"
      @close="showAddModal = false"
      @saved="handleMovieSaved"
    />

    <MovieModal
      v-if="editingMovie"
      :show="showEditModal"
      :movie="editingMovie"
      @close="closeEditModal"
      @saved="handleMovieSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMoviesStore } from '../../stores/movies';
import { useAuthStore } from '../../stores/auth';
import SearchBar from '../../components/SearchBar/SearchBar.vue';
import MovieCard from '../../components/MovieCard/MovieCard.vue';
import MovieModal from '../../components/MovieModal/MovieModal.vue';
import Button from '../../components/common/Button/Button.vue';

interface Movie {
  id: string;
  title: string;
  releaseDate: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
}

const moviesStore = useMoviesStore();
const authStore = useAuthStore();

const showAddModal = ref<boolean>(false);
const showEditModal = ref<boolean>(false);
const editingMovie = ref<Movie | null>(null);

onMounted(() => {
  moviesStore.fetchMovies();
});

const handleMovieSaved = (): void => {
  moviesStore.fetchMovies();
};

const closeEditModal = (): void => {
  showEditModal.value = false;
  editingMovie.value = null;
};
</script>

<style scoped>
.home {
  padding-top: var(--spacing-xl);
  animation: fadeIn var(--transition-normal) ease-out;
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  align-items: flex-start;
  position: relative;
}

.header-section::after {
  content: '';
  position: absolute;
  bottom: calc(-1 * var(--spacing-xl));
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-color), transparent);
}

.movies-grid {
  margin-top: var(--spacing-xl);
  animation: fadeIn var(--transition-slow) ease-out;
}

.movies-grid > * {
  animation: fadeIn var(--transition-normal) ease-out;
  animation-fill-mode: both;
}

.movies-grid > *:nth-child(1) { animation-delay: 0.1s; }
.movies-grid > *:nth-child(2) { animation-delay: 0.2s; }
.movies-grid > *:nth-child(3) { animation-delay: 0.3s; }
.movies-grid > *:nth-child(4) { animation-delay: 0.4s; }
.movies-grid > *:nth-child(5) { animation-delay: 0.5s; }
.movies-grid > *:nth-child(6) { animation-delay: 0.6s; }
</style>
