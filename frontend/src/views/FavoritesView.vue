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

    <div v-else class="content-grid">
      <CategoryItem
        v-for="media in favoriteMedia" 
        :key="media.id"
        :id="media.id.toString()"
        :title="media.name"
        :image="media.image"
        :rating="media.score || 0"
        :slug="media.slug"
        :mediaType="media.type === 'movie' ? 'movies' : 'series'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserListsStore } from '@/stores/userListsStore';
import { useAuthStore } from '@/stores/authStore';
import { getMediaDetailsBatch, type MediaItem } from '@/services/userMediaService';
import CategoryItem from '@/components/CategoryItem.vue';

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

onMounted(loadFavorites);
</script>

<style scoped>
.user-list-view {
  padding: 2rem;
  width: 100%;
}

.content-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
  justify-content: start;
  padding-bottom: 60px;
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

@media (max-width: 768px) {
  .user-list-view {
    padding: 1rem;
  }
  
  .list-title {
    font-size: 2rem;
  }
}
</style>
