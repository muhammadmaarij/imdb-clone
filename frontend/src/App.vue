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
              <button @click="handleLogout" class="btn-logout">Logout</button>
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

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = (): void => {
  authStore.logout();
  router.push("/");
};
</script>

<style>
/* App-level styles (not scoped - needed for layout) */
@import "./styles/variables.css";

.navbar {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: var(--spacing-md) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-sm);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: "Poppins", sans-serif;
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  background: var(--bg-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  letter-spacing: -0.5px;
  transition: transform var(--transition-fast);
}

.logo:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: var(--weight-medium);
  font-size: var(--font-base);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width var(--transition-normal);
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(229, 9, 20, 0.1);
}

.nav-link:hover::before {
  width: 80%;
}

.nav-link.router-link-active {
  color: var(--color-primary);
}

.nav-link.router-link-active::before {
  width: 80%;
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-left: var(--spacing-lg);
  border-left: 1px solid var(--border-light);
  margin-left: var(--spacing-md);
}

.username {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--font-base);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.username::before {
  content: "👤";
  font-size: var(--font-sm);
}

.btn-logout {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  font-size: var(--font-base);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.btn-logout:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-primary);
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: var(--spacing-xl) var(--spacing-lg);
  position: relative;
}

/* Background Pattern */
.main-content::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(
      circle at 20% 50%,
      rgba(229, 9, 20, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(229, 9, 20, 0.05) 0%,
      transparent 50%
    );
  pointer-events: none;
  z-index: -1;
}
</style>
