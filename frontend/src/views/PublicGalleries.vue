<template>
  <div>
    <!-- Hero Header -->
    <header class="text-center mb-8">
      <h1 class="section-title">Explora Galerías Públicas</h1>
      <p class="section-desc">Descubre colecciones de imágenes compartidas por nuestra comunidad</p>
    </header>

    <!-- Stats & Filters Toolbar -->
    <div class="header-actions">
      <!-- Search Input -->
      <div style="position: relative; max-width: 380px; width: 100%;">
        <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
          <Search :size="18" />
        </span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar galerías o creadores..." 
          class="form-input" 
          style="padding-left: 2.75rem;" 
        />
      </div>

      <!-- Quick Stats -->
      <div style="display: flex; gap: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
        <div>
          <strong style="color: var(--primary);">{{ filteredGalleries.length }}</strong> 
          <span> {{ filteredGalleries.length === 1 ? 'galería' : 'galerías' }}</span>
        </div>
        <div>
          <strong style="color: var(--accent-gradient);">{{ totalPhotos }}</strong> 
          <span> {{ totalPhotos === 1 ? 'foto' : 'fotos' }} en total</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando galerías públicas...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredGalleries.length === 0" class="text-center" style="padding: 4rem 1.5rem; background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
      <Folder :size="48" style="color: var(--text-muted); margin-bottom: 1rem;" />
      <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">No se encontraron galerías</h3>
      <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto;">
        No pudimos encontrar galerías que coincidan con tu búsqueda. ¡Prueba buscando otro término!
      </p>
    </div>

    <!-- Galleries Grid -->
    <div v-else class="gallery-grid">
      <router-link 
        v-for="gallery in filteredGalleries" 
        :key="gallery.id" 
        :to="`/gallery/${gallery.id}`" 
        class="gallery-card"
      >
        <!-- Cover Photo -->
        <div class="gallery-cover">
          <img 
            v-if="gallery.photos && gallery.photos.length > 0" 
            :src="gallery.photos[0].imageUrl" 
            :alt="gallery.title" 
            class="photo-image"
          />
          <div v-else class="cover-placeholder">
            <Image :size="40" />
            <span style="font-size: 0.85rem; font-weight: 500;">Galería Vacía</span>
          </div>
          <div class="gallery-cover-gradient"></div>
          <span class="gallery-badge badge-public">Pública</span>
        </div>

        <!-- Info -->
        <div class="gallery-info">
          <h3 class="gallery-title">{{ gallery.title }}</h3>
          <p class="gallery-desc">{{ gallery.description || 'Sin descripción adicional.' }}</p>
          
          <div class="gallery-meta">
            <div class="meta-owner">
              <User :size="14" />
              <span>{{ gallery.owner?.name || 'Usuario' }}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.3rem;">
              <ImageIcon :size="14" />
              <span>{{ gallery.photos ? gallery.photos.length : 0 }} {{ (gallery.photos?.length === 1) ? 'foto' : 'fotos' }}</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { showToast } from '../utils/toast';
import { Search, Folder, Image, User, Image as ImageIcon } from 'lucide-vue-next';

const galleries = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const fetchPublicGalleries = async () => {
  loading.value = true;
  try {
    const response = await api.get('/galleries/public');
    // Expected response structure: { status: 'success', data: { galleries: [...] } }
    galleries.value = response.data.data.galleries;
  } catch (err) {
    showToast('Error al cargar las galerías públicas', 'error');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPublicGalleries();
});

const filteredGalleries = computed(() => {
  if (!searchQuery.value.trim()) return galleries.value;
  const query = searchQuery.value.toLowerCase();
  return galleries.value.filter((g) => {
    const titleMatch = g.title.toLowerCase().includes(query);
    const descMatch = (g.description || '').toLowerCase().includes(query);
    const ownerMatch = (g.owner?.name || '').toLowerCase().includes(query);
    return titleMatch || descMatch || ownerMatch;
  });
});

const totalPhotos = computed(() => {
  return filteredGalleries.value.reduce((acc, curr) => {
    return acc + (curr.photos ? curr.photos.length : 0);
  }, 0);
});
</script>
