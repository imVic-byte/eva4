import { reactive, computed } from 'vue';
import api from '../services/api';

const state = reactive({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null
});

const isAuthenticated = computed(() => !!state.token);

const setToken = (token) => {
  state.token = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const login = async (email, password) => {
  state.loading = true;
  state.error = null;
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    setToken(token);
    state.user = user;
    return response.data;
  } catch (err) {
    state.error = err.response?.data?.message || 'Credenciales inválidas';
    throw err;
  } finally {
    state.loading = false;
  }
};

const register = async (name, email, password) => {
  state.loading = true;
  state.error = null;
  try {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data.data;
    setToken(token);
    state.user = user;
    return response.data;
  } catch (err) {
    state.error = err.response?.data?.message || 'Error al registrar usuario';
    throw err;
  } finally {
    state.loading = false;
  }
};

const logout = () => {
  setToken(null);
  state.user = null;
};

const fetchCurrentUser = async () => {
  if (!state.token) return null;
  state.loading = true;
  try {
    const response = await api.get('/auth/me');
    state.user = response.data.data.user;
    return state.user;
  } catch (err) {
    logout();
    return null;
  } finally {
    state.loading = false;
  }
};

export const useAuth = () => {
  return {
    state,
    isAuthenticated,
    login,
    register,
    logout,
    fetchCurrentUser
  };
};
