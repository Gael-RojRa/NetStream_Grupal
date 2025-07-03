<script setup lang="ts">
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useUserListsStore } from '@/stores/userListsStore';
import { computed, onMounted, watch } from 'vue';

const props = defineProps<{
  id: string
  title: string
  image?: string
  rating: number
  slug?: string
  mediaType?: 'series' | 'movies'
}>()

const authStore = useAuthStore();
const userListsStore = useUserListsStore();

// Computed para obtener el estado del media
const mediaStatus = computed(() => {
  if (!authStore.isAuthenticated) {
    return null;
  }
  
  const mediaType = props.mediaType === 'movies' ? 'movie' : 'series';
  
  // Intentar diferentes formas de obtener un ID válido
  let mediaId: number;
  
  console.log('ID original:', props.id, 'tipo:', typeof props.id);
  
  // Si el ID es una cadena de número puro, convertir directamente
  if (!isNaN(Number(props.id))) {
    mediaId = Number(props.id);
  } 
  // Si el ID tiene formato "series-123456" o "movie-123456", extraer el número
  else if (props.id.includes('-')) {
    const parts = props.id.split('-');
    const numericPart = parts[parts.length - 1]; // Tomar la última parte después del guión
    if (!isNaN(Number(numericPart))) {
      mediaId = Number(numericPart);
      console.log('ID extraído del formato con guión:', numericPart, '→', mediaId);
    } else {
      // Si no se puede extraer un número, usar hash como fallback
      mediaId = Math.abs(props.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));
      console.log('Usando hash como fallback:', mediaId);
    }
  }
  // Fallback para otros formatos
  else {
    mediaId = Math.abs(props.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
    console.log('Usando hash para formato desconocido:', mediaId);
  }
  
  console.log(`Checking status for media ${mediaId} (${mediaType}) - original ID: ${props.id}`, {
    watchlistLength: userListsStore.watchlist.length,
    watchedLength: userListsStore.watched.length,
    favoritesLength: userListsStore.favorites.length,
    watchlistItems: userListsStore.watchlist,
    isInWatchlist: userListsStore.isInWatchlist(mediaId, mediaType),
    isWatched: userListsStore.isWatched(mediaId, mediaType),
    isFavorite: userListsStore.isFavorite(mediaId, mediaType)
  });
  
  return {
    isWatched: userListsStore.isWatched(mediaId, mediaType),
    isFavorite: userListsStore.isFavorite(mediaId, mediaType),
    isInWatchlist: userListsStore.isInWatchlist(mediaId, mediaType)
  };
});

// Cargar el estado cuando se monta el componente
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      // Siempre intentar cargar las listas para asegurar que estén actualizadas
      await userListsStore.loadAllLists();
      console.log('Lists loaded in CategoryItem:', {
        watchlist: userListsStore.watchlist.length,
        watched: userListsStore.watched.length,
        favorites: userListsStore.favorites.length
      });
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
        <!-- Debug temporal -->
        <div style="position: absolute; top: -20px; left: 0; font-size: 10px; color: red;">
          {{ mediaStatus.isInWatchlist ? 'W' : '' }}{{ mediaStatus.isWatched ? 'V' : '' }}{{ mediaStatus.isFavorite ? 'F' : '' }}
        </div>
        
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
  border: 2px solid #bac3ff;
  border-radius: 15px;
  transform: scale(1.02);
  padding: 6px;
  box-shadow: 0 8px 25px rgba(186, 195, 255, 0.2);
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
  background-color: rgba(239, 68, 68, 0.8);
  color: white;
}

.status-indicator.watched {
  background-color: rgba(34, 197, 94, 0.8);
  color: white;
}

.status-indicator.watchlist {
  background-color: rgba(59, 130, 246, 0.8);
  color: white;
}

.status-icon {
  width: 12px;
  height: 12px;
  filter: brightness(1) invert(1);
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