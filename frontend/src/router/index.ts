import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home/Home.vue';
import MovieDetails from '../views/MovieDetails/MovieDetails.vue';
import Login from '../views/Login/Login.vue';
import Register from '../views/Register/Register.vue';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/movies/:id',
    name: 'MovieDetails',
    component: MovieDetails,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
