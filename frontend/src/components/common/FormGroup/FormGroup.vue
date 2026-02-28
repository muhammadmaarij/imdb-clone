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
import './FormGroup.css';

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
