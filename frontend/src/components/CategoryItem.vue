<script setup lang="ts">
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useUserListsStore } from '@/stores/userListsStore';
import { computed, onMounted, watch } from 'vue';

const props = defineProps<{
  id: string | number
  title: string
  image?: string
  rating: number
  slug?: string
  mediaType?: 'series' | 'movies'
}>()

const authStore = useAuthStore();
const userListsStore = useUserListsStore();

  const mediaStatus = computed(() => {
  if (!authStore.isAuthenticated) {
    return null;
  }
  
  const mediaType = props.mediaType === 'movies' ? 'movie' : 'series';
  
  // Intentar diferentes formas de obtener un ID válido
  let mediaId: number;
  if (typeof props.id === 'string') {
    // Para resultados de búsqueda, el ID puede ser un string directo
    if (props.id.includes('-')) {
      const parts = props.id.split('-');
      mediaId = parseInt(parts[parts.length - 1]);
    } else {
      mediaId = parseInt(props.id);
    }
  } else {
    mediaId = props.id;
  }
  
  // Validar que tenemos un ID válido
  if (isNaN(mediaId) || mediaId <= 0) {
    console.warn(`Invalid media ID for ${props.title}:`, props.id);
    return null;
  }

  const status = {
    isWatched: userListsStore.isWatched(mediaId, mediaType),
    isFavorite: userListsStore.isFavorite(mediaId, mediaType),
    isInWatchlist: userListsStore.isInWatchlist(mediaId, mediaType)
  };

  // Debug: Mostrar info solo si algún estado es true
  if (status.isWatched || status.isFavorite || status.isInWatchlist) {
    console.log(`🎬 Media status for "${props.title}" (ID: ${mediaId}, Type: ${mediaType}):`, status);
  }
  
  return status;
});

// Cargar el estado cuando se monta el componente
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      // Si no hay listas cargadas, cargarlas
      if (userListsStore.watchlist.length === 0 && 
          userListsStore.watched.length === 0 && 
          userListsStore.favorites.length === 0) {
        await userListsStore.loadAllLists();
      }
    } catch (error) {
      console.error('Error loading user lists in CategoryItem:', error);
    }
  }
});

// Observar cambios en la autenticación para cargar listas cuando el usuario se loguee
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    try {
      await userListsStore.loadAllLists();
    } catch (error) {
      console.error('Error loading user lists after login:', error);
    }
  }
});

// Observar cambios en las listas para refrescar el estado cuando se actualicen
watch([
  () => userListsStore.watchlist.length,
  () => userListsStore.watched.length, 
  () => userListsStore.favorites.length
], () => {
  // Forzar recálculo del estado computado
  // El computed se actualizará automáticamente
}, { flush: 'post' });

const detailSerie = () => {
  if (props.mediaType === 'movies') {
    router.push({
      name: 'movie-details',
      params: {
        slug: props.slug,
      }
    });
  } else if (props.mediaType === 'series') {
    router.push({
      name: 'serie-details',
      params: {
        slug: props.slug,
      }
    });
  } else {
    router.push({
      name: 'serie-details',
      params: {
        slug: props.slug,
      }
    });
  }
}
</script>

<template>
  <div class="category__item" @click="detailSerie()">
    <div class="category__image-container">
      <img 
        class="category__item-image" 
        :src="image" 
        :alt="title" 
        loading="lazy"
        decoding="async"
      />
      
      <!-- Indicadores de estado -->
      <div v-if="mediaStatus && authStore.isAuthenticated" class="status-indicators">
        <!-- En lista de seguimiento -->
        <div v-if="mediaStatus.isInWatchlist" class="status-indicator watchlist" title="En lista de seguimiento">
          <img src="../images/watchlist.svg" alt="Watchlist" class="status-icon">
        </div>
        
        <!-- Visto -->
        <div v-if="mediaStatus.isWatched" class="status-indicator watched" title="Visto">
          <img src="../images/watched.svg" alt="Watched" class="status-icon">
        </div>
        
        <!-- Favorito -->
        <div v-if="mediaStatus.isFavorite" class="status-indicator favorite" title="En favoritos">
          <img src="../images/favorite.svg" alt="Favorite" class="status-icon">
        </div>
      </div>
      
      <div class="category__item-rating">{{ rating }}</div>
    </div>
    <h3 class="category__item-title">{{ title }}</h3>
  </div>
</template>

<style scoped>
.category__item {
  display: flex;
  flex-direction: column;
  flex: 1 1 145px;
  max-width: 200px;
  min-width: 145px;
  transition: all 0.3s ease-out;
  cursor: pointer;
}

.category__item:hover {
  border: 1px solid #bac3ff;
  border-radius: 15px;
  padding: 6px;
  box-shadow: 8px rgba(186, 195, 255, 0.2);
}

.category__image-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

.category__item-image {
  width: 100%;
  height: 100%;
  max-height: 285px;
  border-radius: 10px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category__item:hover .category__item-image {
  transform: scale(1.05);
}

.category__item-rating {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.category__item-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 3.5em;
  line-height: 1.4em;
  margin-top: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #bfbdc2;
  transition: color 0.3s ease;
}

.category__item:hover .category__item-title {
  color: #ffffff;
}

/* Status indicators */
.status-indicators {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
  z-index: 2;
}

.status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.status-indicator:hover {
  transform: scale(1.1);
}

.status-indicator.favorite {
  background-color: rgba(59, 130, 246, 0.8);
  color: white;
}

.status-indicator.watched {
  background-color: rgba(59, 130, 246, 0.8);
  color: white;
}

.status-indicator.watchlist {
  background-color: rgba(59, 130, 246, 0.8);
  color: white;
}

.status-icon {
  width: 12px;
  height: 12px;
  filter: brightness(0) saturate(100%);
  object-fit: contain;
  max-width: 12px;
  max-height: 12px;
  flex-shrink: 0;
}

/* Ajuste específico para el icono de favoritos */
.status-indicator.favorite .status-icon {
  width: 10px !important;
  height: 10px !important;
  max-width: 10px !important;
  max-height: 10px !important;
}
</style>