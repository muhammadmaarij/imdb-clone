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
import './MovieModal.css';

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
