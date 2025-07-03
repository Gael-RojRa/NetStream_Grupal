<template>
  <div class="user-list-view">
    <div class="list-header">
      <h1 class="list-title">
        <img src="../images/watchlist.svg" alt="" class="title-icon">
        Mi Watchlist
      </h1>
      <p class="list-description">
        Películas y series que quieres ver más tarde
      </p>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Cargando watchlist...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadWatchlist" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="watchlistMedia.length === 0" class="empty-state">
      <img src="../images/watchlist.svg" alt="" class="empty-icon">
      <h2>Tu watchlist está vacía</h2>
      <p>Explora películas y series para agregar a tu lista de reproducción</p>
      <router-link to="/shows/movies" class="explore-button">
        Explorar Películas
      </router-link>
    </div>

    <div v-else class="content-grid">
      <CategoryItem
        v-for="media in watchlistMedia" 
        :key="`${media.id}-${media.type}`"
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

const watchlistMedia = ref<MediaItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const loadWatchlist = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/');
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    await userListsStore.loadAllLists();
    
    // Cargar los detalles reales de cada media en la watchlist
    if (userListsStore.watchlist.length > 0) {
      watchlistMedia.value = await getMediaDetailsBatch(userListsStore.watchlist);
    } else {
      watchlistMedia.value = [];
    }
    
  } catch (err: any) {
    error.value = err.message || 'Error al cargar la watchlist';
  } finally {
    isLoading.value = false;
  }
};

const removeFromWatchlist = async (mediaId: number, mediaType: 'movie' | 'series') => {
  try {
    await userListsStore.toggleWatchlist(mediaId, mediaType);
    watchlistMedia.value = watchlistMedia.value.filter(media => !(media.id === mediaId && media.type === mediaType));
  } catch (err: any) {
    console.error('Error removing from watchlist:', err);
  }
};

onMounted(loadWatchlist);
</script>

<style scoped>
.user-list-view {
  max-width: 1400px;
  margin: 0 auto;
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

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {

  .list-title {
    font-size: 2rem;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>
