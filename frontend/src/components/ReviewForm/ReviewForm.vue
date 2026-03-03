<template>
  <div class="review-form card">
    <h3 class="section-title">
      {{ editingReview ? "Edit Review" : "Write a Review" }}
    </h3>
    <form @submit.prevent="handleSubmit">
      <FormGroup id="rating" label="Rating" :required="true">
        <select
          id="rating"
          v-model="formData.rating"
          required
          class="form-input"
        >
          <option value="">Select rating</option>
          <option :value="1">1 - Poor</option>
          <option :value="2">2 - Fair</option>
          <option :value="3">3 - Good</option>
          <option :value="4">4 - Very Good</option>
          <option :value="5">5 - Excellent</option>
        </select>
      </FormGroup>
      <FormGroup id="comment" label="Comment" :required="true">
        <textarea
          id="comment"
          v-model="formData.comment"
          rows="4"
          required
          placeholder="Write your review..."
          class="form-input"
        ></textarea>
      </FormGroup>
      <div v-if="error" class="error-message text-error">{{ error }}</div>
      <div class="form-actions flex flex-end gap-md">
        <Button
          v-if="editingReview"
          variant="secondary"
          @click="cancel"
          label="Cancel"
        />
        <Button
          type="submit"
          :loading="loading"
          :label="editingReview ? 'Update Review' : 'Submit Review'"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import api from "../../services/api";
import FormGroup from "../common/FormGroup/FormGroup.vue";
import Button from "../common/Button/Button.vue";

interface Review {
  id: string;
  rating: number;
  comment: string;
}

interface ReviewFormData {
  rating: number | string;
  comment: string;
}

const props = defineProps<{
  movieId: string;
  review?: Review | null;
}>();

const emit = defineEmits<{
  saved: [];
  cancelled: [];
}>();

const formData = ref<ReviewFormData>({
  rating: "",
  comment: "",
});

const error = ref<string>("");
const loading = ref<boolean>(false);

const editingReview = computed(() => !!props.review);

watch(
  () => props.review,
  (review) => {
    if (review) {
      formData.value = {
        rating: review.rating,
        comment: review.comment,
      };
    } else {
      formData.value = {
        rating: "",
        comment: "",
      };
    }
    error.value = "";
  },
  { immediate: true }
);

const cancel = (): void => {
  emit("cancelled");
};

const handleSubmit = async (): Promise<void> => {
  error.value = "";
  loading.value = true;

  try {
    if (editingReview.value && props.review) {
      await api.put(`/reviews/${props.review.id}`, formData.value);
    } else {
      await api.post("/reviews", {
        movieId: props.movieId,
        ...formData.value,
      });
    }
    emit("saved");
    formData.value = { rating: "", comment: "" };
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    error.value = axiosError.response?.data?.message || "Failed to save review";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.review-form {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
}

.review-form .section-title {
  margin-bottom: var(--spacing-lg);
}

.form-actions {
  margin-top: var(--spacing-lg);
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

.review-form select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-md) center;
  padding-right: 2.5rem;
}

.review-form select.form-input:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23e50914' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}
</style>
