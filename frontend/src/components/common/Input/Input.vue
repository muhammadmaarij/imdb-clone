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
import './Input.css';

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
