import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserListsStore } from '@/stores/userListsStore';

export function useAppInitialization() {
  const authStore = useAuthStore();
  const userListsStore = useUserListsStore();

  const initializeApp = async () => {
    // Si el usuario está autenticado (tiene token), cargar sus listas
    if (authStore.isAuthenticated) {
      try {
        await userListsStore.loadAllLists();
      } catch (error) {
        console.error('Error loading user lists on app initialization:', error);
      }
    }
  };

  onMounted(() => {
    initializeApp();
  });

  return {
    initializeApp
  };
}
