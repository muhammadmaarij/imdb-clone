<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :minlength="minlength"
      :maxlength="maxlength"
      @input="handleInput"
      @blur="handleBlur"
      class="form-input"
      :class="{ 'has-error': error }"
    />
    <small v-if="hint" class="form-hint">{{ hint }}</small>
    <span v-if="error" class="form-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  type?: string;
  label?: string;
  placeholder?: string;
  modelValue: string | number;
  required?: boolean;
  disabled?: boolean;
  minlength?: number;
  maxlength?: number;
  hint?: string;
  error?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
}>();

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleBlur = (): void => {
  emit('blur');
};
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.form-label {
  font-weight: var(--weight-semibold);
  display: block;
  color: var(--text-primary);
  font-size: var(--font-sm);
  margin-bottom: var(--spacing-xs);
  letter-spacing: 0.3px;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-base);
  font-family: inherit;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.form-input:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-primary);
  background: var(--bg-tertiary);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-primary);
}

.form-input.has-error {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.1);
}

.form-hint {
  color: var(--text-secondary);
  font-size: var(--font-xs);
  margin-top: var(--spacing-xs);
}

.form-error {
  color: var(--color-primary-light);
  font-size: var(--font-xs);
  font-weight: var(--weight-medium);
  margin-top: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.form-error::before {
  content: "⚠";
  font-size: var(--font-sm);
}
</style>
