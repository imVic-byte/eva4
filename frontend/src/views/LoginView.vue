<template>
  <div style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 200px);">
    <div class="modal-content" style="max-width: 440px; box-shadow: var(--shadow-lg);">
      <!-- Tabs -->
      <div class="tabs" style="padding: 1.5rem 1.5rem 0 1.5rem; margin-bottom: 0;">
        <button 
          @click="activeTab = 'login'" 
          :class="['tab-btn', { active: activeTab === 'login' }]"
          style="flex: 1;"
        >
          Iniciar Sesión
        </button>
        <button 
          @click="activeTab = 'register'" 
          :class="['tab-btn', { active: activeTab === 'register' }]"
          style="flex: 1;"
        >
          Crear Cuenta
        </button>
      </div>

      <div class="modal-body" style="padding: 2rem 1.5rem;">
        <!-- Login Form -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Correo Electrónico</label>
            <input 
              v-model="loginForm.email" 
              type="email" 
              required 
              placeholder="correo@ejemplo.com" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              required 
              placeholder="••••••••" 
              class="form-input" 
            />
          </div>

          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="state.loading" 
            style="width: 100%; margin-top: 1.5rem; height: 46px;"
          >
            <span v-if="state.loading" class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span>
            <span v-else>Entrar</span>
          </button>
        </form>

        <!-- Register Form -->
        <form v-else @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label">Nombre Completo</label>
            <input 
              v-model="registerForm.name" 
              type="text" 
              required 
              placeholder="Tu nombre" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Correo Electrónico</label>
            <input 
              v-model="registerForm.email" 
              type="email" 
              required 
              placeholder="correo@ejemplo.com" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input 
              v-model="registerForm.password" 
              type="password" 
              required 
              placeholder="Mínimo 6 caracteres" 
              class="form-input" 
              minlength="6"
            />
          </div>

          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="state.loading" 
            style="width: 100%; margin-top: 1.5rem; height: 46px;"
          >
            <span v-if="state.loading" class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span>
            <span v-else>Registrarme</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';
import { showToast } from '../utils/toast';

const router = useRouter();
const { state, login, register } = useAuth();

const activeTab = ref('login');

const loginForm = reactive({
  email: '',
  password: ''
});

const registerForm = reactive({
  name: '',
  email: '',
  password: ''
});

const handleLogin = async () => {
  try {
    await login(loginForm.email, loginForm.password);
    showToast(`¡Bienvenido de vuelta, ${state.user.name}!`, 'success');
    router.push('/dashboard');
  } catch (err) {
    showToast(state.error || 'Error al iniciar sesión', 'error');
  }
};

const handleRegister = async () => {
  try {
    await register(registerForm.name, registerForm.email, registerForm.password);
    showToast('Cuenta creada e inicio de sesión correcto', 'success');
    router.push('/dashboard');
  } catch (err) {
    showToast(state.error || 'Error al registrarse', 'error');
  }
};
</script>
