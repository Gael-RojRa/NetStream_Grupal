<template>

  <button class="action-button" :class="{ active: isInWatchlist }" @click="handleWatchlistToggle"
    :disabled="loading.watchlist">
    <img class="action-icon" src="../images/watchlist.svg" alt="">

  </button>

  <button class="action-button" :class="{ active: isWatched }" @click="handleWatchedToggle" :disabled="loading.watched">
    <img class="action-icon" src="../images/watched.svg" alt="">

  </button>

  <button class="action-button" :class="{ active: isFavorite }" @click="handleFavoriteToggle"
    :disabled="loading.favorite">
    <img class="action-icon" src="../images/favorite.svg" alt="">
  </button>

  <!-- Modal de Login -->
  <LoginModal :show-modal="showLoginModal" @close="showLoginModal = false" @login-success="onLoginSuccess" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserListsStore } from '@/stores/userListsStore';
import LoginModal from './LoginModal.vue';

interface Props {
  mediaId: number;
  mediaType: 'movie' | 'series';
}

const props = defineProps<Props>();

const authStore = useAuthStore();
const userListsStore = useUserListsStore();

const showLoginModal = ref(false);
const loading = ref({
  watchlist: false,
  watched: false,
  favorite: false
});

// Estados computados
const isInWatchlist = computed(() => {
  return authStore.isAuthenticated ? userListsStore.isInWatchlist(props.mediaId, props.mediaType) : false;
});

const isWatched = computed(() => {
  return authStore.isAuthenticated ? userListsStore.isWatched(props.mediaId, props.mediaType) : false;
});

const isFavorite = computed(() => {
  return authStore.isAuthenticated ? userListsStore.isFavorite(props.mediaId, props.mediaType) : false;
});

// Función helper para requerir autenticación
const requireAuth = (action: () => Promise<void>) => {
  return async () => {
    if (!authStore.isAuthenticated) {
      showLoginModal.value = true;
      return;
    }
    await action();
  };
};

// Handlers para las acciones
const handleWatchlistToggle = requireAuth(async () => {
  loading.value.watchlist = true;
  try {
    await userListsStore.toggleWatchlist(props.mediaId, props.mediaType);
  } catch (error) {
    console.error('Error toggling watchlist:', error);
  } finally {
    loading.value.watchlist = false;
  }
});

const handleWatchedToggle = requireAuth(async () => {
  loading.value.watched = true;
  try {
    await userListsStore.toggleWatched(props.mediaId, props.mediaType);
  } catch (error) {
    console.error('Error toggling watched:', error);
  } finally {
    loading.value.watched = false;
  }
});

const handleFavoriteToggle = requireAuth(async () => {
  loading.value.favorite = true;
  try {
    await userListsStore.toggleFavorite(props.mediaId, props.mediaType);
  } catch (error) {
    console.error('Error toggling favorite:', error);
  } finally {
    loading.value.favorite = false;
  }
});

const onLoginSuccess = async () => {
  // Cargar las listas del usuario después del login
  await userListsStore.loadAllLists();
};
</script>

<style scoped>
.media-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  justify-content: center;
  padding: 20px;
}

.action-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-button.active {
  background: #365bfe;
  color: #fff;
}

.action-button.active:hover:not(:disabled) {
  background: #2a4bd7;
}

.action-icon {
  width: 100%;
  filter: brightness(0.9);
}

.action-button.active .action-icon {
  filter: brightness(1);
}

.action-text {
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .media-actions {
    flex-direction: column;
  }

}
</style>
