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
import "./Login.css";

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
