<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando detalles de la galería...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center" style="padding: 4rem 1.5rem; background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid rgba(239, 68, 68, 0.2);">
      <Lock v-if="errorStatus === 403" :size="48" style="color: var(--warning); margin-bottom: 1rem;" />
      <XCircle v-else :size="48" style="color: var(--danger); margin-bottom: 1rem;" />
      
      <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">{{ errorTitle }}</h3>
      <p style="color: var(--text-secondary); max-width: 450px; margin: 0 auto 1.5rem auto;">
        {{ errorMessage }}
      </p>
      <router-link to="/" class="btn btn-secondary">
        Volver a Explorar
      </router-link>
    </div>

    <!-- Gallery Detail View -->
    <div v-else-if="gallery">
      <!-- Gallery Header Card -->
      <div class="gallery-card" style="padding: 2rem; margin-bottom: 2.5rem; flex-direction: row; flex-wrap: wrap; justify-content: space-between; gap: 1.5rem; align-items: flex-start; background: linear-gradient(135deg, rgba(22, 30, 46, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);">
        <div style="flex: 1; min-width: 280px;">
          <!-- Visibility & Meta Tags -->
          <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap;">
            <span :class="['gallery-badge', gallery.visibility === 'public' ? 'badge-public' : 'badge-private']" style="position: static;">
              {{ gallery.visibility === 'public' ? 'Pública' : 'Privada' }}
            </span>
            <span style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.25rem;">
              <Calendar :size="12" />
              Creada el {{ formatDate(gallery.createdAt) }}
            </span>
          </div>

          <h1 class="gallery-title" style="font-size: 2.2rem; margin-bottom: 0.75rem; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            {{ gallery.title }}
          </h1>
          <p class="gallery-desc" style="-webkit-line-clamp: unset; display: block; margin-bottom: 1rem; font-size: 1.05rem;">
            {{ gallery.description || 'Sin descripción adicional.' }}
          </p>

          <!-- Owner info -->
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
            <User :size="16" style="color: var(--primary);" />
            <span>Galería creada por <strong>{{ gallery.owner?.name || 'Usuario' }}</strong></span>
          </div>
        </div>

        <!-- Owner Actions Panel -->
        <div v-if="isOwner" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button @click="openEditGalleryModal" class="btn btn-secondary">
            <Edit :size="16" />
            <span>Editar Datos</span>
          </button>
          <button @click="openAddPhotoModal" class="btn btn-primary">
            <Plus :size="18" />
            <span>Agregar Foto</span>
          </button>
          <button @click="handleDeleteGallery" class="btn btn-danger">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>

      <!-- Section Divider & Toolbar -->
      <div class="header-actions">
        <h2 style="font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
          <ImageIcon :size="22" style="color: var(--primary);" />
          <span>Fotos de esta colección ({{ gallery.photos?.length || 0 }})</span>
        </h2>
      </div>

      <!-- Empty Photos State -->
      <div v-if="!gallery.photos || gallery.photos.length === 0" class="text-center" style="padding: 5rem 1.5rem; background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <ImageOff :size="48" style="color: var(--text-muted); margin-bottom: 1rem;" />
        <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">Esta galería no tiene fotos</h3>
        <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto 1.5rem auto;">
          {{ isOwner ? 'Comienza a poblar tu galería agregando algunas fotos ahora.' : 'El propietario no ha subido ninguna foto todavía.' }}
        </p>
        <button v-if="isOwner" @click="openAddPhotoModal" class="btn btn-primary">
          <Plus :size="18" />
          <span>Agregar Primera Foto</span>
        </button>
      </div>

      <!-- Photos Grid -->
      <div v-else class="photo-grid">
        <div 
          v-for="(photo, index) in gallery.photos" 
          :key="photo.id" 
          class="photo-card"
          @click="openLightbox(index)"
        >
          <img :src="photo.imageUrl" :alt="photo.title" class="photo-image" />
          <div class="photo-overlay">
            <h4 class="photo-title">{{ photo.title }}</h4>
            <p class="photo-desc">{{ photo.description || '' }}</p>
          </div>

          <!-- Photo Actions if Owner -->
          <div v-if="isOwner" class="photo-actions" @click.stop>
            <button @click="openEditPhotoModal(photo)" class="action-btn" title="Editar Foto">
              <Edit :size="12" />
            </button>
            <button @click="handleDeletePhoto(photo.id)" class="action-btn delete" title="Eliminar Foto">
              <Trash2 :size="12" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Gallery Modal -->
    <div v-if="showEditGalleryModal" class="modal-backdrop" @click.self="closeEditGalleryModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Editar Información</h3>
          <button @click="closeEditGalleryModal" class="modal-close">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="saveGalleryInfo">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Título</label>
              <input 
                v-model="galleryForm.title" 
                type="text" 
                required 
                class="form-input" 
                minlength="3"
                maxlength="120"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea 
                v-model="galleryForm.description" 
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Visibilidad</label>
              <select v-model="galleryForm.visibility" class="form-select">
                <option value="private">Privada</option>
                <option value="public">Pública</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeEditGalleryModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add / Edit Photo Modal -->
    <div v-if="showPhotoModal" class="modal-backdrop" @click.self="closePhotoModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditingPhoto ? 'Modificar Foto' : 'Agregar Foto' }}</h3>
          <button @click="closePhotoModal" class="modal-close">
            <X :size="20" />
          </button>
        </div>

        <!-- Add Photo Mode Tabs (Only when creating) -->
        <div v-if="!isEditingPhoto" class="tabs" style="padding: 1rem 1.5rem 0 1.5rem; margin-bottom: 0;">
          <button 
            type="button"
            @click="photoUploadMode = 'url'" 
            :class="['tab-btn', { active: photoUploadMode === 'url' }]"
            style="flex: 1; font-size: 0.9rem; padding: 0.5rem;"
          >
            <Link2 :size="14" style="margin-right: 0.3rem;" />
            Por URL
          </button>
          <button 
            type="button"
            @click="photoUploadMode = 'file'" 
            :class="['tab-btn', { active: photoUploadMode === 'file' }]"
            style="flex: 1; font-size: 0.9rem; padding: 0.5rem;"
          >
            <CloudUpload :size="14" style="margin-right: 0.3rem;" />
            Subir Archivo
          </button>
        </div>

        <form @submit.prevent="savePhoto" enctype="multipart/form-data">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Título de la Foto</label>
              <input 
                v-model="photoForm.title" 
                type="text" 
                required 
                placeholder="Ej. Bosque de Arrayanes" 
                class="form-input" 
                minlength="2"
                maxlength="120"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea 
                v-model="photoForm.description" 
                placeholder="Opcional. Describe brevemente la foto" 
                class="form-textarea"
              ></textarea>
            </div>

            <!-- Mode URL Input -->
            <div v-if="photoUploadMode === 'url' || isEditingPhoto" class="form-group">
              <label class="form-label">URL de la Imagen</label>
              <input 
                v-model="photoForm.imageUrl" 
                type="url" 
                required 
                placeholder="https://ejemplo.com/imagen.jpg" 
                class="form-input" 
              />
            </div>

            <!-- Mode File Upload Input -->
            <div v-else class="form-group">
              <label class="form-label">Selecciona Imagen</label>
              <input 
                type="file" 
                ref="fileInput"
                required 
                accept="image/*"
                class="form-input" 
                style="padding: 0.5rem;"
                @change="handleFileChange"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closePhotoModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
              <span v-else>{{ isEditingPhoto ? 'Actualizar' : 'Agregar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lightbox Overlay -->
    <div 
      v-if="lightboxActive" 
      class="lightbox-backdrop" 
      @click.self="closeLightbox"
    >
      <button @click="closeLightbox" class="lightbox-close">
        <X :size="32" />
      </button>

      <!-- Navigation Arrows -->
      <button v-if="gallery.photos.length > 1" @click="prevPhoto" class="lightbox-nav lightbox-prev">
        <ChevronLeft :size="24" />
      </button>
      <button v-if="gallery.photos.length > 1" @click="nextPhoto" class="lightbox-nav lightbox-next">
        <ChevronRight :size="24" />
      </button>

      <div class="lightbox-content">
        <img 
          :src="currentLightboxPhoto.imageUrl" 
          :alt="currentLightboxPhoto.title" 
          class="lightbox-image" 
        />
        <div class="lightbox-meta">
          <h4>{{ currentLightboxPhoto.title }}</h4>
          <p>{{ currentLightboxPhoto.description || 'Sin descripción' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { useAuth } from '../store/auth';
import { showToast } from '../utils/toast';
import { 
  Lock, XCircle, Calendar, User, Edit, Plus, Trash2, X, Link2, 
  CloudUpload, ChevronLeft, ChevronRight, Image as ImageIcon, ImageOff 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const gallery = ref(null);
const loading = ref(true);
const error = ref(false);
const errorStatus = ref(null);
const errorTitle = ref('');
const errorMessage = ref('');

const submitting = ref(false);

// Edit Gallery Data
const showEditGalleryModal = ref(false);
const galleryForm = reactive({
  title: '',
  description: '',
  visibility: 'private'
});

// Photo Add / Edit Data
const showPhotoModal = ref(false);
const isEditingPhoto = ref(false);
const editingPhotoId = ref(null);
const photoUploadMode = ref('url'); // 'url' or 'file'
const fileInput = ref(null);
const selectedFile = ref(null);

const photoForm = reactive({
  title: '',
  description: '',
  imageUrl: ''
});

// Lightbox Data
const lightboxActive = ref(false);
const currentPhotoIndex = ref(0);

const isOwner = computed(() => {
  if (!gallery.value || !auth.state.user) return false;
  return gallery.value.userId === auth.state.user.id || auth.state.user.role === 'admin';
});

const currentLightboxPhoto = computed(() => {
  if (!gallery.value || !gallery.value.photos) return null;
  return gallery.value.photos[currentPhotoIndex.value];
});

const fetchGalleryDetails = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await api.get(`/galleries/${route.params.id}`);
    gallery.value = response.data.data.gallery;
  } catch (err) {
    error.value = true;
    errorStatus.value = err.response?.status || 500;
    if (errorStatus.value === 403) {
      errorTitle.value = 'Galería Privada';
      errorMessage.value = 'Esta galería es de carácter privado. No tienes autorización para visualizarla a menos que seas el propietario.';
    } else if (errorStatus.value === 404) {
      errorTitle.value = 'No Encontrada';
      errorMessage.value = 'La galería que buscas no existe o ha sido eliminada por su dueño.';
    } else {
      errorTitle.value = 'Error Inesperado';
      errorMessage.value = 'Ha ocurrido un error al conectar con el servidor. Inténtalo de nuevo más tarde.';
    }
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchGalleryDetails();
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Edit Gallery functions
const openEditGalleryModal = () => {
  galleryForm.title = gallery.value.title;
  galleryForm.description = gallery.value.description;
  galleryForm.visibility = gallery.value.visibility;
  showEditGalleryModal.value = true;
};

const closeEditGalleryModal = () => {
  showEditGalleryModal.value = false;
};

const saveGalleryInfo = async () => {
  submitting.value = true;
  try {
    await api.put(`/galleries/${gallery.value.id}`, galleryForm);
    showToast('Galería actualizada correctamente', 'success');
    closeEditGalleryModal();
    fetchGalleryDetails();
  } catch (err) {
    showToast(err.response?.data?.message || 'Error al guardar cambios', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteGallery = async () => {
  if (!confirm('¿Deseas eliminar esta galería y todas sus fotos de forma permanente?')) return;
  try {
    await api.delete(`/galleries/${gallery.value.id}`);
    showToast('Galería eliminada', 'success');
    router.push('/dashboard');
  } catch (err) {
    showToast('Error al eliminar la galería', 'error');
  }
};

// Add / Edit Photo functions
const openAddPhotoModal = () => {
  isEditingPhoto.value = false;
  editingPhotoId.value = null;
  photoUploadMode.value = 'url';
  selectedFile.value = null;
  photoForm.title = '';
  photoForm.description = '';
  photoForm.imageUrl = '';
  showPhotoModal.value = true;
};

const openEditPhotoModal = (photo) => {
  isEditingPhoto.value = true;
  editingPhotoId.value = photo.id;
  photoForm.title = photo.title;
  photoForm.description = photo.description;
  photoForm.imageUrl = photo.imageUrl;
  showPhotoModal.value = true;
};

const closePhotoModal = () => {
  showPhotoModal.value = false;
};

const handleFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};

const savePhoto = async () => {
  submitting.value = true;
  try {
    if (isEditingPhoto.value) {
      // Photo edits always run as standard JSON
      await api.put(`/galleries/${gallery.value.id}/photos/${editingPhotoId.value}`, {
        title: photoForm.title,
        description: photoForm.description,
        imageUrl: photoForm.imageUrl
      });
      showToast('Foto modificada correctamente', 'success');
    } else {
      // Adding new photo
      if (photoUploadMode.value === 'url') {
        await api.post(`/galleries/${gallery.value.id}/photos`, {
          title: photoForm.title,
          description: photoForm.description,
          imageUrl: photoForm.imageUrl
        });
      } else {
        if (!selectedFile.value) {
          showToast('Debes seleccionar un archivo', 'error');
          submitting.value = false;
          return;
        }
        
        // Prepare multipart form data
        const formData = new FormData();
        formData.append('title', photoForm.title);
        formData.append('description', photoForm.description);
        formData.append('image', selectedFile.value);

        await api.post(`/galleries/${gallery.value.id}/photos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      showToast('Foto agregada correctamente', 'success');
    }
    closePhotoModal();
    fetchGalleryDetails();
  } catch (err) {
    showToast(err.response?.data?.message || 'Error al guardar la foto', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleDeletePhoto = async (photoId) => {
  if (!confirm('¿Deseas quitar esta foto de tu galería?')) return;
  try {
    await api.delete(`/galleries/${gallery.value.id}/photos/${photoId}`);
    showToast('Foto eliminada', 'success');
    fetchGalleryDetails();
  } catch (err) {
    showToast('Error al eliminar la foto', 'error');
  }
};

// Lightbox functions
const openLightbox = (index) => {
  // If clicking action buttons, do not open lightbox
  currentPhotoIndex.value = index;
  lightboxActive.value = true;
};

const closeLightbox = () => {
  lightboxActive.value = false;
};

const prevPhoto = () => {
  if (currentPhotoIndex.value === 0) {
    currentPhotoIndex.value = gallery.value.photos.length - 1;
  } else {
    currentPhotoIndex.value--;
  }
};

const nextPhoto = () => {
  if (currentPhotoIndex.value === gallery.value.photos.length - 1) {
    currentPhotoIndex.value = 0;
  } else {
    currentPhotoIndex.value++;
  }
};

const handleGlobalKeydown = (e) => {
  if (!lightboxActive.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevPhoto();
  if (e.key === 'ArrowRight') nextPhoto();
};
</script>
