import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../store/auth';

const routes = [
  {
    path: '/',
    name: 'PublicGalleries',
    component: () => import('../views/PublicGalleries.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/gallery/:id',
    name: 'GalleryDetail',
    component: () => import('../views/GalleryDetail.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuth();

  // Try to load user profile if token exists but state user is empty
  if (auth.isAuthenticated.value && !auth.state.user) {
    await auth.fetchCurrentUser();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    next({ name: 'Login' });
  } else if (to.meta.guestOnly && auth.isAuthenticated.value) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
