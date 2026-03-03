<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header flex-between">
        <h2 class="section-title">{{ isEdit ? 'Edit Movie' : 'Add Movie' }}</h2>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      <form @submit.prevent="handleSubmit" class="modal-form">
        <FormGroup id="title" label="Title" :required="true" :error="titleError">
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            class="form-input"
          />
        </FormGroup>
        <FormGroup id="releaseDate" label="Release Date" :required="true">
          <input
            id="releaseDate"
            v-model="formData.releaseDate"
            type="date"
            required
            class="form-input"
          />
        </FormGroup>
        <FormGroup id="description" label="Description" :required="true">
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            required
            class="form-input"
          ></textarea>
        </FormGroup>
        <FormGroup id="posterUrl" label="Poster URL" :required="true">
          <input
            id="posterUrl"
            v-model="formData.posterUrl"
            type="url"
            required
            class="form-input"
          />
        </FormGroup>
        <FormGroup id="trailerUrl" label="Trailer URL" :required="true">
          <input
            id="trailerUrl"
            v-model="formData.trailerUrl"
            type="url"
            required
            class="form-input"
          />
        </FormGroup>
        <div v-if="error" class="error-message text-error">{{ error }}</div>
        <div class="modal-actions flex flex-end gap-md">
          <Button variant="secondary" @click="close" label="Cancel" />
          <Button type="submit" :loading="loading" :label="isEdit ? 'Update' : 'Create'" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useMoviesStore } from '../../stores/movies';
import FormGroup from '../common/FormGroup/FormGroup.vue';
import Button from '../common/Button/Button.vue';

interface Movie {
  id: string;
  title: string;
  releaseDate: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
}

interface MovieFormData {
  title: string;
  releaseDate: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
}

const props = defineProps<{
  show: boolean;
  movie?: Movie | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const moviesStore = useMoviesStore();

const formData = ref<MovieFormData>({
  title: '',
  releaseDate: '',
  description: '',
  posterUrl: '',
  trailerUrl: '',
});

const error = ref<string>('');
const titleError = ref<string>('');
const loading = ref<boolean>(false);

const isEdit = computed(() => !!props.movie);

watch(
  () => props.movie,
  (movie) => {
    if (movie) {
      formData.value = {
        title: movie.title || '',
        releaseDate: movie.releaseDate
          ? new Date(movie.releaseDate).toISOString().split('T')[0]
          : '',
        description: movie.description || '',
        posterUrl: movie.posterUrl || '',
        trailerUrl: movie.trailerUrl || '',
      };
    } else {
      formData.value = {
        title: '',
        releaseDate: '',
        description: '',
        posterUrl: '',
        trailerUrl: '',
      };
    }
    error.value = '';
    titleError.value = '';
  },
  { immediate: true }
);

const close = (): void => {
  emit('close');
};

const handleSubmit = async (): Promise<void> => {
  error.value = '';
  titleError.value = '';
  loading.value = true;

  const result = isEdit.value && props.movie
    ? await moviesStore.updateMovie(props.movie.id, formData.value)
    : await moviesStore.createMovie(formData.value);

  if (result.success) {
    emit('saved');
    close();
  } else {
    error.value = result.message || 'An error occurred';
    if (result.message?.includes('title')) {
      titleError.value = result.message;
    }
  }

  loading.value = false;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  backdrop-filter: var(--overlay-blur);
  -webkit-backdrop-filter: var(--overlay-blur);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
  animation: fadeIn var(--transition-fast) ease-out;
  padding: var(--spacing-lg);
}

.modal-content {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xl);
  animation: slideIn var(--transition-bounce) ease-out;
  position: relative;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--color-secondary);
  border-radius: var(--radius-full);
}

.modal-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-glass);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.close-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: var(--font-2xl);
  cursor: pointer;
  line-height: 1;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  font-weight: var(--weight-bold);
}

.close-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  transform: rotate(90deg);
}

.modal-form {
  padding: var(--spacing-xl);
}

.modal-actions {
  margin-top: var(--spacing-xl);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.error-message {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(229, 9, 20, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  color: var(--color-primary-light);
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
}
</style>
