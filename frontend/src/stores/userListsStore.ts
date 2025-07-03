import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { 
  getWatchlist, 
  getWatched, 
  getFavorites,
  addToWatchlist,
  removeFromWatchlist,
  markAsWatched,
  removeFromWatched,
  addToFavorites,
  removeFromFavorites,
  getMediaStatus,
  type MediaStatus
} from '@/services/backendService';

export const useUserListsStore = defineStore('userLists', () => {
  const watchlist = ref<{ id: number; type: 'movie' | 'series' }[]>([]);
  const watched = ref<{ id: number; type: 'movie' | 'series' }[]>([]);
  const favorites = ref<{ id: number; type: 'movie' | 'series' }[]>([]);
  const mediaStatusCache = ref<Map<string, MediaStatus>>(new Map());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed para verificar estados con más validación
  const isInWatchlist = computed(() => (mediaId: number, mediaType: 'movie' | 'series') => {
    if (!mediaId || mediaId <= 0) return false;
    return watchlist.value.some(item => item.id === mediaId && item.type === mediaType);
  });
  
  const isWatched = computed(() => (mediaId: number, mediaType: 'movie' | 'series') => {
    if (!mediaId || mediaId <= 0) return false;
    return watched.value.some(item => item.id === mediaId && item.type === mediaType);
  });
  
  const isFavorite = computed(() => (mediaId: number, mediaType: 'movie' | 'series') => {
    if (!mediaId || mediaId <= 0) return false;
    return favorites.value.some(item => item.id === mediaId && item.type === mediaType);
  });

  async function loadAllLists() {
    isLoading.value = true;
    error.value = null;

    try {
      const [watchlistData, watchedData, favoritesData] = await Promise.all([
        getWatchlist(),
        getWatched(),
        getFavorites()
      ]);

      // Mapear correctamente los datos del backend
      watchlist.value = watchlistData.map(item => ({ 
        id: item.media_id, 
        type: item.media_type === 'movie' ? 'movie' : 'series' 
      }));
      watched.value = watchedData.map(item => ({ 
        id: item.media_id, 
        type: item.media_type === 'movie' ? 'movie' : 'series' 
      }));
      favorites.value = favoritesData.map(item => ({ 
        id: item.media_id, 
        type: item.media_type === 'movie' ? 'movie' : 'series' 
      }));

      console.log('📊 User lists loaded:', {
        watchlist: watchlist.value.length,
        watched: watched.value.length,
        favorites: favorites.value.length
      });
    } catch (err: any) {
      error.value = err.message || 'Error al cargar las listas';
      console.error('Error loading user lists:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleWatchlist(mediaId: number, mediaType: 'movie' | 'series') {
    const isCurrentlyInWatchlist = watchlist.value.some(item => item.id === mediaId && item.type === mediaType);

    try {
      if (isCurrentlyInWatchlist) {
        await removeFromWatchlist(mediaId, mediaType);
        watchlist.value = watchlist.value.filter(item => !(item.id === mediaId && item.type === mediaType));
      } else {
        await addToWatchlist(mediaId, mediaType);
        watchlist.value.push({ id: mediaId, type: mediaType });
      }
      
      // Actualizar cache
      updateMediaStatusCache(mediaId, mediaType, { watchlist: !isCurrentlyInWatchlist });
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar watchlist';
      throw err;
    }
  }

  async function toggleWatched(mediaId: number, mediaType: 'movie' | 'series') {
    const isCurrentlyWatched = watched.value.some(item => item.id === mediaId && item.type === mediaType);
    
    try {
      if (isCurrentlyWatched) {
        await removeFromWatched(mediaId, mediaType);
        watched.value = watched.value.filter(item => !(item.id === mediaId && item.type === mediaType));
      } else {
        await markAsWatched(mediaId, mediaType);
        watched.value.push({ id: mediaId, type: mediaType });
      }
      
      // Actualizar cache
      updateMediaStatusCache(mediaId, mediaType, { watched: !isCurrentlyWatched });
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar watched';
      throw err;
    }
  }

  async function toggleFavorite(mediaId: number, mediaType: 'movie' | 'series') {
    const isCurrentlyFavorite = favorites.value.some(item => item.id === mediaId && item.type === mediaType);
    
    try {
      if (isCurrentlyFavorite) {
        await removeFromFavorites(mediaId, mediaType);
        favorites.value = favorites.value.filter(item => !(item.id === mediaId && item.type === mediaType));
      } else {
        await addToFavorites(mediaId, mediaType);
        favorites.value.push({ id: mediaId, type: mediaType });
      }
      
      // Actualizar cache
      updateMediaStatusCache(mediaId, mediaType, { favorite: !isCurrentlyFavorite });
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar favorites';
      throw err;
    }
  }

  function updateMediaStatusCache(mediaId: number, mediaType: 'movie' | 'series', updates: Partial<MediaStatus>) {
    const key = `${mediaId}-${mediaType}`;
    const current = mediaStatusCache.value.get(key) || {
      id: mediaId,
      type: mediaType,
      watched: false,
      favorite: false,
      watchlist: false
    };
    
    mediaStatusCache.value.set(key, { ...current, ...updates });
  }

  async function getMediaStatusBatch(mediaItems: { id: number; type: 'movie' | 'series' }[]) {
    try {
      const formattedItems = mediaItems.map(item => ({ media_id: item.id, media_type: item.type }));
      const statuses = await getMediaStatus(formattedItems as any);
      statuses.forEach(status => {
        const key = `${status.id}-${status.type}`;
        mediaStatusCache.value.set(key, status);
      });
      return statuses;
    } catch (err: any) {
      error.value = err.message || 'Error al obtener estados de media';
      throw err;
    }
  }

  function clearError() {
    error.value = null;
  }

  function clearLists() {
    watchlist.value = [];
    watched.value = [];
    favorites.value = [];
    mediaStatusCache.value.clear();
  }

  return {
    watchlist,
    watched,
    favorites,
    mediaStatusCache,
    isLoading,
    error,
    isInWatchlist,
    isWatched,
    isFavorite,
    loadAllLists,
    toggleWatchlist,
    toggleWatched,
    toggleFavorite,
    getMediaStatusBatch,
    clearError,
    clearLists
  };
});
