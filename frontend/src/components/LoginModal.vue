<template>
  <div class="login-modal" v-if="showModal" @click="closeModal">
    <div class="login-container" @click.stop>
      <div class="login-header">
        <h2>{{ isLoginMode ? 'Iniciar Sesión' : 'Registrarse' }}</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">Usuario:</label>
          <input 
            type="text" 
            id="username" 
            v-model="credentials.username" 
            required 
            :disabled="authStore.isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input 
            type="password" 
            id="password" 
            v-model="credentials.password" 
            required 
            :disabled="authStore.isLoading"
          />
        </div>
        
        <div class="error-message" v-if="authStore.error">
          {{ authStore.error }}
        </div>
        
        <button 
          type="submit" 
          class="submit-button"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? 'Cargando...' : (isLoginMode ? 'Iniciar Sesión' : 'Registrarse') }}
        </button>
        
        <p class="toggle-mode">
          {{ isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
          <button type="button" @click="toggleMode" class="toggle-button">
            {{ isLoginMode ? 'Registrarse' : 'Iniciar Sesión' }}
          </button>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserListsStore } from '@/stores/userListsStore';

interface Props {
  showModal: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'login-success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const userListsStore = useUserListsStore();

const isLoginMode = ref(true);
const credentials = reactive({
  username: '',
  password: ''
});

const handleSubmit = async () => {
  authStore.clearError();
  
  let success = false;
  
  if (isLoginMode.value) {
    success = await authStore.login(credentials);
  } else {
    success = await authStore.register(credentials);
    if (success) {
      // Auto-login después del registro
      success = await authStore.login(credentials);
    }
  }
  
  if (success) {
    // Cargar las listas del usuario después del login
    await userListsStore.loadAllLists();
    emit('login-success');
    closeModal();
  }
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  authStore.clearError();
  credentials.username = '';
  credentials.password = '';
};

const closeModal = () => {
  emit('close');
  authStore.clearError();
  credentials.username = '';
  credentials.password = '';
};
</script>

<style scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: auto;
}

.login-container {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  margin: auto;
  position: relative;
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.login-header h2 {
  color: #fff;
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #365bfe;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #fff;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 6px;
  background: #2a2a2a;
  color: #fff;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #365bfe;
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
}

.submit-button {
  background: #365bfe;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  background: #2a4bd7;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-mode {
  text-align: center;
  color: #ccc;
  margin-top: 1rem;
}

.toggle-button {
  background: none;
  border: none;
  color: #365bfe;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.toggle-button:hover {
  color: #2a4bd7;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .login-container {
    width: 95%;
    padding: 1.5rem;
    margin: 1rem auto;
  }
  
  .login-header h2 {
    font-size: 1.25rem;
  }
  
  .close-button {
    font-size: 1.5rem;
    width: 24px;
    height: 24px;
  }
}

@media (max-height: 600px) {
  .login-modal {
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .login-container {
    margin-top: 0;
  }
}
</style>
