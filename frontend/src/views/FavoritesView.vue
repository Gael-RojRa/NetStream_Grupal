<template>
  <div class="user-list-view">
    <div class="list-header">
      <h1 class="list-title">
        <img src="../images/favorite.svg" alt="" class="title-icon">
        Favoritos
      </h1>
      <p class="list-description">
        Tus películas y series favoritas
      </p>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Cargando favoritos...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadFavorites" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="favoriteMedia.length === 0" class="empty-state">
      <img src="../images/favorite.svg" alt="" class="empty-icon">
      <h2>No tienes favoritos aún</h2>
      <p>Marca películas y series como favoritas para crear tu colección especial</p>
      <router-link to="/shows/movies" class="explore-button">
        Explorar Películas
      </router-link>
    </div>

    <div v-else class="media-grid">
      <div 
        v-for="media in favoriteMedia" 
        :key="media.id"
        class="media-card"
        @click="goToDetail(media)"
      >
        <div class="media-poster">
          <img :src="media.image" :alt="media.name" @error="onImageError">
          <div class="favorite-badge">
            <img src="../images/favorite.svg" alt="Favorito" class="badge-icon">
          </div>
          <div class="remove-overlay">
            <button 
              @click.stop="removeFromFavorites(media.id, media.type)"
              class="remove-button"
              title="Quitar de favoritos"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="media-info">
          <h3 class="media-title">{{ media.name }}</h3>
          <p class="media-year">{{ media.year }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserListsStore } from '@/stores/userListsStore';
import { useAuthStore } from '@/stores/authStore';
import { getMediaDetailsBatch, type MediaItem } from '@/services/userMediaService';

const router = useRouter();
const userListsStore = useUserListsStore();
const authStore = useAuthStore();

const favoriteMedia = ref<MediaItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const loadFavorites = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/');
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    await userListsStore.loadAllLists();
    
    // Cargar los detalles reales de cada media en favoritos
    if (userListsStore.favorites.length > 0) {
      favoriteMedia.value = await getMediaDetailsBatch(userListsStore.favorites);
    } else {
      favoriteMedia.value = [];
    }
    
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los favoritos';
  } finally {
    isLoading.value = false;
  }
};

const removeFromFavorites = async (mediaId: number, mediaType: 'movie' | 'series') => {
  try {
    await userListsStore.toggleFavorite(mediaId, mediaType);
    favoriteMedia.value = favoriteMedia.value.filter(media => !(media.id === mediaId && media.type === mediaType));
  } catch (err: any) {
    console.error('Error removing from favorites:', err);
  }
};

const goToDetail = (media: any) => {
  const mediaType = media.type === 'movie' ? 'movie' : 'series';
  router.push(`/media/${mediaType}/${media.id}`);
};

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder-poster.jpg';
};

onMounted(loadFavorites);
</script>

<style scoped>
.user-list-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.list-header {
  margin-bottom: 2rem;
}

.list-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.5rem;
}

.title-icon {
  width: 40px;
  height: 40px;
}

.list-description {
  color: #ccc;
  font-size: 1.1rem;
  margin: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #ccc;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top: 3px solid #365bfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 4rem;
  color: #ff6b6b;
}

.retry-button {
  background: #365bfe;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-button:hover {
  background: #2a4bd7;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #ccc;
}

.empty-icon {
  width: 80px;
  height: 80px;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.explore-button {
  display: inline-block;
  background: #365bfe;
  color: #fff;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.explore-button:hover {
  background: #2a4bd7;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.media-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
}

.media-card:hover {
  transform: translateY(-5px);
}

.media-poster {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: 12px;
  overflow: hidden;
  background: #333;
}

.media-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(255, 107, 107, 0.9);
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.remove-overlay {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 0 12px 0 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-card:hover .remove-overlay {
  opacity: 1;
}

.remove-button {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  padding: 0.5rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  color: #ff6b6b;
}

.media-info {
  padding: 1rem 0;
}

.media-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.media-year {
  color: #ccc;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .user-list-view {
    padding: 1rem;
  }
  
  .list-title {
    font-size: 2rem;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>
