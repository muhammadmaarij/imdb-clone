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
          :error="passwordError"
        />

        <!-- Real-time password strength feedback -->
        <div v-if="password.length > 0" class="password-requirements">
          <p class="requirements-title">Password Requirements:</p>
          <ul class="requirements-list">
            <li :class="{ met: hasMinLength }">
              <span class="check-icon">{{ hasMinLength ? '✓' : '✗' }}</span>
              At least 8 characters
            </li>
            <li :class="{ met: hasUppercase }">
              <span class="check-icon">{{ hasUppercase ? '✓' : '✗' }}</span>
              Contains an uppercase letter (A-Z)
            </li>
            <li :class="{ met: hasLowercase }">
              <span class="check-icon">{{ hasLowercase ? '✓' : '✗' }}</span>
              Contains a lowercase letter (a-z)
            </li>
            <li :class="{ met: hasNumber }">
              <span class="check-icon">{{ hasNumber ? '✓' : '✗' }}</span>
              Contains a number (0-9)
            </li>
          </ul>
        </div>

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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import Input from "../../components/common/Input/Input.vue";
import Button from "../../components/common/Button/Button.vue";

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

// Real-time password validation
const hasMinLength = computed(() => password.value.length >= 8);
const hasUppercase = computed(() => /[A-Z]/.test(password.value));
const hasLowercase = computed(() => /[a-z]/.test(password.value));
const hasNumber = computed(() => /[0-9]/.test(password.value));
const isPasswordValid = computed(
  () => hasMinLength.value && hasUppercase.value && hasLowercase.value && hasNumber.value
);

const handleRegister = async (): Promise<void> => {
  error.value = "";
  usernameError.value = "";
  emailError.value = "";
  passwordError.value = "";

  // Client-side validation with user-friendly messages
  if (username.value.length < 3) {
    usernameError.value = "Username must be at least 3 characters";
    return;
  }

  if (!isPasswordValid.value) {
    passwordError.value = "Please meet all password requirements above";
    return;
  }

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

.password-requirements {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-top: calc(-1 * var(--spacing-sm));
}

.requirements-title {
  font-size: var(--font-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.requirements-list li {
  font-size: var(--font-sm);
  color: var(--color-primary-light);
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.requirements-list li.met {
  color: var(--color-success);
}

.check-icon {
  font-weight: var(--weight-bold);
  width: 16px;
  display: inline-flex;
  justify-content: center;
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
