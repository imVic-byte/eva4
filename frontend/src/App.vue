<template>
  <div class="app-container">
    <!-- Glass Navbar -->
    <nav class="navbar">
      <router-link to="/" class="nav-brand">
        <Image :size="24" />
        <span>PixelGallery</span>
      </router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link">
          <Globe :size="18" />
          <span>Explorar</span>
        </router-link>
        
        <router-link v-if="isAuthenticated" to="/dashboard" class="nav-link">
          <Folder :size="18" />
          <span>Mis Galerías</span>
        </router-link>
      </div>

      <div class="nav-user">
        <template v-if="isAuthenticated">
          <div class="user-tag">
            <User :size="14" />
            <span>{{ state.user?.name || 'Usuario' }}</span>
          </div>
          <button @click="handleLogout" class="btn btn-ghost">
            <LogOut :size="18" />
            <span>Salir</span>
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-primary">
            <LogIn :size="18" />
            <span>Acceder</span>
          </router-link>
        </template>
      </div>
    </nav>

    <!-- Main View with Router -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        :class="['toast', `toast-${toast.type}`]"
      >
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from './store/auth';
import { useToastState, showToast } from './utils/toast';
import { Image, Globe, Folder, User, LogIn, LogOut } from 'lucide-vue-next';

const router = useRouter();
const { state, isAuthenticated, logout, fetchCurrentUser } = useAuth();
const toasts = useToastState();

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await fetchCurrentUser();
    } catch (err) {
      showToast('Sesión expirada', 'error');
    }
  }
});

const handleLogout = () => {
  logout();
  showToast('Has cerrado sesión correctamente', 'info');
  router.push('/');
};
</script>

<style>
/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
