import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';
import { backendLogin, backendRegister, type LoginCredentials, type RegisterCredentials } from '@/services/backendService';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('jwt_token'));
  const user = ref<{ id: number; username: string } | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials: LoginCredentials) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await backendLogin(credentials);
      token.value = response.token;
      localStorage.setItem('jwt_token', response.token);
      
      // Decodificar el token para obtener información del usuario (opcional)
      // En un caso real, podrías hacer una llamada adicional para obtener datos del usuario
      
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(credentials: RegisterCredentials) {
    isLoading.value = true;
    error.value = null;
    
    try {
      await backendRegister(credentials);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al registrar usuario';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwt_token');
    
    // Limpiar las listas del usuario al hacer logout
    import('./userListsStore').then(({ useUserListsStore }) => {
      const userListsStore = useUserListsStore();
      userListsStore.clearLists();
    });

    // Redirigir a la página de Explore (Home)
    router.push('/');
  }

  function clearError() {
    error.value = null;
  }

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError
  };
});
