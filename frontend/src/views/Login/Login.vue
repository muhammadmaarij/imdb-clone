<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="page-title">Login</h1>
      <form @submit.prevent="handleLogin" class="auth-form">
        <Input
          id="email"
          v-model="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          :required="true"
          :error="emailError"
        />
        <Input
          id="password"
          v-model="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          :required="true"
          :error="passwordError"
        />
        <div v-if="error" class="error-message">{{ error }}</div>
        <Button type="submit" :loading="loading" label="Login" />
        <p class="auth-link">
          Don't have an account?
          <router-link to="/register">Register here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import Input from "../../components/common/Input/Input.vue";
import Button from "../../components/common/Button/Button.vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref<string>("");
const password = ref<string>("");
const error = ref<string>("");
const emailError = ref<string>("");
const passwordError = ref<string>("");
const loading = ref<boolean>(false);

const handleLogin = async (): Promise<void> => {
  error.value = "";
  emailError.value = "";
  passwordError.value = "";
  loading.value = true;

  const result = await authStore.login(email.value, password.value);

  if (result.success) {
    router.push("/");
  } else {
    error.value = result.message || "Login failed";
  }

  loading.value = false;
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: var(--spacing-xl);
  animation: fadeIn var(--transition-normal) ease-out;
}

.auth-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 450px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xl);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--bg-gradient-primary);
}

.auth-card .page-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.error-message {
  color: var(--color-primary-light);
  font-size: var(--font-sm);
  text-align: center;
  padding: var(--spacing-md);
  background: rgba(229, 9, 20, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
}

.auth-link {
  text-align: center;
  margin-top: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.auth-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--weight-semibold);
  transition: all var(--transition-fast);
  position: relative;
}

.auth-link a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width var(--transition-normal);
}

.auth-link a:hover {
  color: var(--color-primary-light);
}

.auth-link a:hover::after {
  width: 100%;
}
</style>
