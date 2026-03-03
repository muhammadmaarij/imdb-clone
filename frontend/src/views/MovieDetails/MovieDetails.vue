<template>
  <div v-if="loading" class="loading-state">Loading movie details...</div>
  <div v-else-if="movie" class="movie-details container">
    <div class="movie-header">
      <div class="poster-section">
        <img :src="movie.posterUrl" :alt="movie.title" class="poster-large" />
        <div v-if="movie.rank" class="rank-display">Rank #{{ movie.rank }}</div>
      </div>
      <div class="info-section">
        <h1 class="page-title-large">{{ movie.title }}</h1>
        <p class="release-date text-secondary">
          {{ formatDate(movie.releaseDate) }}
        </p>
        <p class="description">{{ movie.description }}</p>
        <div
          v-if="movie.reviewCount !== undefined"
          class="stats text-secondary"
        >
          <span
            >{{ movie.reviewCount }}
            {{ movie.reviewCount === 1 ? "review" : "reviews" }}</span
          >
        </div>
        <div
          v-if="authStore.isAuthenticated && isOwner"
          class="actions flex gap-md"
        >
          <Button variant="secondary" @click="handleEdit" label="Edit Movie" />
          <Button variant="danger" @click="handleDelete" label="Delete Movie" />
        </div>
      </div>
    </div>

    <div class="trailer-section">
      <h2 class="section-title">Trailer</h2>
      <div class="trailer-container">
        <iframe
          :src="getEmbedUrl(movie.trailerUrl)"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="trailer-iframe"
        ></iframe>
      </div>
    </div>

    <div class="reviews-section">
      <h2 class="section-title">Reviews</h2>
      <div v-if="reviews.length === 0" class="empty-state">
        <p>No reviews yet.</p>
      </div>
      <div v-else class="reviews-list">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="review-item card"
        >
          <div class="review-header flex-between">
            <div class="flex gap-md">
              <span class="reviewer-name">{{
                review.user?.username || "Anonymous"
              }}</span>
              <div class="rating">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ filled: i <= review.rating }"
                >
                  ★
                </span>
              </div>
            </div>
            <div
              v-if="isReviewOwner(review)"
              class="review-actions flex gap-sm"
            >
              <Button variant="link" @click="editReview(review)" label="Edit" />
              <Button
                variant="link"
                @click="deleteReview(review.id)"
                label="Delete"
              />
            </div>
          </div>
          <p class="review-comment">{{ review.comment }}</p>
          <p class="review-date text-secondary">
            {{ formatDate(review.createdAt || "") }}
          </p>
        </div>
      </div>

      <ReviewForm
        v-if="authStore.isAuthenticated"
        :movie-id="movie.id"
        :review="editingReview"
        @saved="handleReviewSaved"
        @cancelled="editingReview = null"
      />
    </div>

    <MovieModal
      v-if="editingMovie"
      :show="showEditModal"
      :movie="editingMovie"
      @close="closeEditModal"
      @saved="handleMovieSaved"
    />
  </div>
  <div v-else class="empty-state">Movie not found</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMoviesStore } from "../../stores/movies";
import { useAuthStore } from "../../stores/auth";
import ReviewForm from "../../components/ReviewForm/ReviewForm.vue";
import MovieModal from "../../components/MovieModal/MovieModal.vue";
import Button from "../../components/common/Button/Button.vue";
import api from "../../services/api";

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
}

interface ReviewUser {
  id: string;
  username: string;
  email: string;
}

interface Review {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: string;
  user?: ReviewUser;
}

const route = useRoute();
const router = useRouter();
const moviesStore = useMoviesStore();
const authStore = useAuthStore();

const movie = ref<Movie | null>(null);
const reviews = ref<Review[]>([]);
const loading = ref<boolean>(true);
const editingReview = ref<Review | null>(null);
const editingMovie = ref<Movie | null>(null);
const showEditModal = ref<boolean>(false);

const isOwner = computed(() => {
  return (
    authStore.isAuthenticated &&
    movie.value &&
    movie.value.userId === authStore.user?.id
  );
});

onMounted(async () => {
  await loadMovie();
  await loadReviews();
});

const loadMovie = async (): Promise<void> => {
  try {
    await moviesStore.fetchMovieById(route.params.id as string);
    movie.value = moviesStore.currentMovie;
  } catch (error) {
    console.error("Failed to load movie:", error);
  } finally {
    loading.value = false;
  }
};

const loadReviews = async (): Promise<void> => {
  try {
    const response = await api.get<{ data: Review[] }>(
      `/reviews/movie/${route.params.id}`
    );
    reviews.value = response.data.data;
  } catch (error) {
    console.error("Failed to load reviews:", error);
  }
};

const formatDate = (date: string): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getEmbedUrl = (url: string): string => {
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const handleEdit = (): void => {
  if (movie.value) {
    editingMovie.value = movie.value;
    showEditModal.value = true;
  }
};

const closeEditModal = (): void => {
  showEditModal.value = false;
  editingMovie.value = null;
};

const handleMovieSaved = async (): Promise<void> => {
  await loadMovie();
};

const handleDelete = async (): Promise<void> => {
  if (movie.value && confirm("Are you sure you want to delete this movie?")) {
    const result = await moviesStore.deleteMovie(movie.value.id);
    if (result.success) {
      router.push("/");
    }
  }
};

const editReview = (review: Review): void => {
  editingReview.value = review;
};

const isReviewOwner = (review: Review): boolean => {
  return authStore.isAuthenticated && review.userId === authStore.user?.id;
};

const deleteReview = async (reviewId: string): Promise<void> => {
  if (confirm("Are you sure you want to delete this review?")) {
    try {
      await api.delete(`/reviews/${reviewId}`);
      await loadReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  }
};

const handleReviewSaved = async (): Promise<void> => {
  editingReview.value = null;
  await loadReviews();
  await loadMovie();
};
</script>

<style scoped>
.movie-details {
  padding-top: var(--spacing-xl);
  animation: fadeIn var(--transition-normal) ease-out;
}

.movie-header {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-3xl);
  padding: var(--spacing-xl);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

.poster-section {
  position: relative;
}

.poster-large {
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  transition: transform var(--transition-normal);
}

.poster-large:hover {
  transform: scale(1.02);
}

.rank-display {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background: var(--bg-gradient-primary);
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  font-weight: var(--weight-bold);
  font-size: var(--font-sm);
  box-shadow: var(--shadow-primary);
  backdrop-filter: blur(10px);
  letter-spacing: 0.5px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.release-date {
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-lg);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.description {
  line-height: var(--line-relaxed);
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: var(--font-base);
}

.stats {
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.stats span {
  color: var(--text-accent);
  font-weight: var(--weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.stats span::before {
  content: '⭐';
}

.actions {
  margin-top: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.trailer-section {
  margin-bottom: var(--spacing-3xl);
  padding: var(--spacing-xl);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

.trailer-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  box-shadow: var(--shadow-md);
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg);
  border: none;
}

.reviews-section {
  margin-bottom: var(--spacing-3xl);
  padding: var(--spacing-xl);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.review-item {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
}

.review-item:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.review-header {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.reviewer-name {
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-base);
}

.rating {
  display: flex;
  gap: var(--spacing-xs);
  margin-left: var(--spacing-md);
}

.star {
  color: var(--rating-empty);
  font-size: var(--font-lg);
  transition: transform var(--transition-fast);
}

.star.filled {
  color: var(--rating-filled);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.review-comment {
  margin: var(--spacing-md) 0;
  line-height: var(--line-relaxed);
  color: var(--text-secondary);
  font-size: var(--font-base);
}

.review-date {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.review-actions {
  margin-top: var(--spacing-sm);
}

@media (max-width: 768px) {
  .movie-header {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .poster-large {
    max-width: 250px;
    margin: 0 auto;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions :deep(.btn) {
    width: 100%;
  }
}
</style>
