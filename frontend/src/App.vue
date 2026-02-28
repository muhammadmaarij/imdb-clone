<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">IMDB Clone</router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <template v-if="authStore.isAuthenticated">
            <div class="user-section">
              <span class="username">{{ authStore.user?.username }}</span>
              <button @click="handleLogout" class="btn-logout">
                Logout
              </button>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">Login</router-link>
            <router-link to="/register" class="nav-link">Register</router-link>
          </template>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "./stores/auth";
import { useRouter } from "vue-router";
import "./styles/global.css";
import "./styles/app.css";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = (): void => {
  authStore.logout();
  router.push("/");
};
</script>
