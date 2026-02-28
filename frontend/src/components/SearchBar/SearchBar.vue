<template>
  <div class="search-bar">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search movies by title..."
      @input="handleSearch"
      class="search-input"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMoviesStore } from '../../stores/movies';
import './SearchBar.css';

const moviesStore = useMoviesStore();
const searchQuery = ref<string>('');
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSearch = (): void => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      moviesStore.searchMovies(searchQuery.value);
    } else {
      moviesStore.fetchMovies();
    }
  }, 300);
};
</script>
