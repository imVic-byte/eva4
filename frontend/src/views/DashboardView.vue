<template>
  <div>
    <!-- Dashboard Header -->
    <header class="header-actions">
      <div>
        <h1 class="section-title">Mi Panel de Control</h1>
        <p class="section-desc" style="margin-bottom: 0;">Administra tus colecciones de fotos personales y públicas</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary">
        <Plus :size="18" />
        <span>Nueva Galería</span>
      </button>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando tus galerías...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="myGalleries.length === 0" class="text-center" style="padding: 4rem 1.5rem; background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
      <FolderOpen :size="48" style="color: var(--text-muted); margin-bottom: 1rem;" />
      <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">No tienes galerías creadas</h3>
      <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto 1.5rem auto;">
        Comienza a compartir y organizar tus fotos creando tu primera galería.
      </p>
      <button @click="openCreateModal" class="btn btn-primary">
        <Plus :size="18" />
        <span>Crear Galería</span>
      </button>
    </div>

    <!-- Galleries Grid -->
    <div v-else class="gallery-grid">
      <div v-for="gallery in myGalleries" :key="gallery.id" class="gallery-card">
        <!-- Cover Photo -->
        <div class="gallery-cover" style="cursor: pointer;" @click="goToGallery(gallery.id)">
          <img 
            v-if="gallery.photos && gallery.photos.length > 0" 
            :src="gallery.photos[0].imageUrl" 
            :alt="gallery.title" 
            class="photo-image"
          />
          <div v-else class="cover-placeholder">
            <ImageIcon :size="40" />
            <span style="font-size: 0.85rem; font-weight: 500;">Galería Vacía</span>
          </div>
          <div class="gallery-cover-gradient"></div>
          
          <!-- Visibility Badge -->
          <span :class="['gallery-badge', gallery.visibility === 'public' ? 'badge-public' : 'badge-private']">
            {{ gallery.visibility === 'public' ? 'Pública' : 'Privada' }}
          </span>
        </div>

        <!-- Info & Actions -->
        <div class="gallery-info">
          <h3 class="gallery-title" style="cursor: pointer;" @click="goToGallery(gallery.id)">{{ gallery.title }}</h3>
          <p class="gallery-desc">{{ gallery.description || 'Sin descripción.' }}</p>
          
          <div class="gallery-meta" style="margin-top: auto;">
            <div style="display: flex; align-items: center; gap: 0.3rem;">
              <ImageIcon :size="14" />
              <span>{{ gallery.photos ? gallery.photos.length : 0 }} {{ gallery.photos?.length === 1 ? 'foto' : 'fotos' }}</span>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
              <button @click="openEditModal(gallery)" class="action-btn" title="Editar Galería">
                <Edit :size="14" />
              </button>
              <button @click="handleDeleteGallery(gallery.id)" class="action-btn delete" title="Eliminar Galería">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? 'Editar Galería' : 'Nueva Galería' }}</h3>
          <button @click="closeModal" class="modal-close">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="saveGallery">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Título</label>
              <input 
                v-model="form.title" 
                type="text" 
                required 
                placeholder="Ej. Mis vacaciones en el sur" 
                class="form-input" 
                minlength="3"
                maxlength="120"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea 
                v-model="form.description" 
                placeholder="Opcional. Describe brevemente el contenido de esta galería" 
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Visibilidad</label>
              <select v-model="form.visibility" class="form-select">
                <option value="private">Privada (solo tú puedes verla)</option>
                <option value="public">Pública (visible para cualquiera)</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
              <span v-else>{{ isEditing ? 'Guardar Cambios' : 'Crear Galería' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { showToast } from '../utils/toast';
import { Plus, X, Edit, Trash2, FolderOpen, Image as ImageIcon } from 'lucide-vue-next';

const router = useRouter();
const myGalleries = ref([]);
const loading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const submitting = ref(false);

const form = reactive({
  title: '',
  description: '',
  visibility: 'private'
});

const fetchMyGalleries = async () => {
  loading.value = true;
  try {
    const response = await api.get('/galleries/my');
    myGalleries.value = response.data.data.galleries;
  } catch (err) {
    showToast('Error al cargar tus galerías', 'error');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMyGalleries();
});

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.title = '';
  form.description = '';
  form.visibility = 'private';
  showModal.value = true;
};

const openEditModal = (gallery) => {
  isEditing.value = true;
  editingId.value = gallery.id;
  form.title = gallery.title;
  form.description = gallery.description;
  form.visibility = gallery.visibility;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveGallery = async () => {
  submitting.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/galleries/${editingId.value}`, form);
      showToast('Galería actualizada correctamente', 'success');
    } else {
      await api.post('/galleries', form);
      showToast('Galería creada correctamente', 'success');
    }
    fetchMyGalleries();
    closeModal();
  } catch (err) {
    showToast(err.response?.data?.message || 'Error al guardar la galería', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteGallery = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta galería y todas sus fotos permanentemente?')) return;
  try {
    await api.delete(`/galleries/${id}`);
    showToast('Galería eliminada correctamente', 'success');
    fetchMyGalleries();
  } catch (err) {
    showToast('Error al eliminar la galería', 'error');
  }
};

const goToGallery = (id) => {
  router.push(`/gallery/${id}`);
};
</script>
