<template>
  <div class="movie-card" @click="goToDetails">
    <div class="poster-container">
      <img :src="movie.posterUrl" :alt="movie.title" class="poster" />
      <div v-if="movie.rank" class="rank-badge">Rank #{{ movie.rank }}</div>
    </div>
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title }}</h3>
      <p class="release-date">{{ formatDate(movie.releaseDate) }}</p>
      <p v-if="movie.reviewCount !== undefined" class="review-count">
        {{ movie.reviewCount }} {{ movie.reviewCount === 1 ? 'review' : 'reviews' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import './MovieCard.css';

interface Movie {
  id: string;
  title: string;
  releaseDate: string;
  posterUrl: string;
  reviewCount?: number;
  rank?: number;
}

const props = defineProps<{
  movie: Movie;
}>();

const router = useRouter();

const goToDetails = (): void => {
  router.push(`/movies/${props.movie.id}`);
};

const formatDate = (date: string): number => {
  return new Date(date).getFullYear();
};
</script>
