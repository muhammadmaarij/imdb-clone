<template>
  <div class="form-group-wrapper">
    <label v-if="label" :for="id" class="form-group-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <slot></slot>
    <small v-if="hint" class="form-group-hint">{{ hint }}</small>
    <span v-if="error" class="form-group-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

withDefaults(defineProps<Props>(), {
  required: false,
});
</script>

<style scoped>
.form-group-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.form-group-label {
  font-weight: var(--weight-semibold);
  display: block;
  color: var(--text-primary);
  font-size: var(--font-sm);
  margin-bottom: var(--spacing-xs);
  letter-spacing: 0.3px;
}

.required {
  color: var(--color-primary);
  margin-left: var(--spacing-xs);
}

.form-group-hint {
  color: var(--text-secondary);
  font-size: var(--font-xs);
  margin-top: var(--spacing-xs);
}

.form-group-error {
  color: var(--color-primary-light);
  font-size: var(--font-xs);
  font-weight: var(--weight-medium);
  margin-top: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.form-group-error::before {
  content: '⚠';
  font-size: var(--font-sm);
}
</style>
