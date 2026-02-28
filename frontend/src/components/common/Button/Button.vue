<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['btn', `btn-${variant}`, { 'btn-loading': loading }]"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import './Button.css';

interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  click: [];
}>();

const handleClick = (): void => {
  emit('click');
};
</script>
