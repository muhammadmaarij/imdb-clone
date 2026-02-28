<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="page-title">Register</h1>
      <form @submit.prevent="handleRegister" class="auth-form">
        <Input
          id="username"
          v-model="username"
          type="text"
          label="Username"
          placeholder="Enter your username"
          :required="true"
          :minlength="3"
          :error="usernameError"
        />
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
          :minlength="8"
          hint="Password must be at least 8 characters with uppercase, lowercase, and number"
          :error="passwordError"
        />
        <div v-if="error" class="error-message">{{ error }}</div>
        <Button type="submit" :loading="loading" label="Register" />
        <p class="auth-link">
          Already have an account?
          <router-link to="/login">Login here</router-link>
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
import "./Register.css";

const router = useRouter();
const authStore = useAuthStore();

const username = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const error = ref<string>("");
const usernameError = ref<string>("");
const emailError = ref<string>("");
const passwordError = ref<string>("");
const loading = ref<boolean>(false);

const handleRegister = async (): Promise<void> => {
  error.value = "";
  usernameError.value = "";
  emailError.value = "";
  passwordError.value = "";
  loading.value = true;

  const result = await authStore.register(username.value, email.value, password.value);

  if (result.success) {
    router.push("/");
  } else {
    error.value = result.message || "Registration failed";
  }

  loading.value = false;
};
</script>
