import { ref } from 'vue';

const toasts = ref([]);

let idCounter = 0;

export const showToast = (message, type = 'success', duration = 4000) => {
  const id = idCounter++;
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
};

export const useToastState = () => toasts;
export const useToast = () => ({ showToast });
