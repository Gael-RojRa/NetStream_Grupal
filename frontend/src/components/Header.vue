<script setup lang="ts">
import { ref } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { useKeyboardManager } from '@/composables/useKeyboardManager'
import { useClickOutside } from '@/composables/useClickOutside'
import { navigationService } from '@/services/navigationService'
import { config } from '@/config'
import type { Datum } from '@/types/searchResult'
import { useAuthStore } from '@/stores/authStore'
import { useUserListsStore } from '@/stores/userListsStore'
import LoginModal from './LoginModal.vue'

const authStore = useAuthStore()
const userListsStore = useUserListsStore()

// Estados locales simples
const showTypeDropdown = ref(false)
const showLoginModal = ref(false)

// Composables con responsabilidades específicas
const {
  searchValue,
  isInputFocused,
  clearSearch,
  searchResults,
  isSearching,
  hasSearchResults
} = useSearch()

const { isKeyboardVisible } = useKeyboardManager()

// Manejo de clicks fuera del componente
useClickOutside(
  () => {
    showTypeDropdown.value = false
  },
  ['.header__search-container', '.search-type-dropdown']
)

// Métodos del componente
const onInputFocus = () => {
  isInputFocused.value = true
  document.body.classList.add('keyboard-visible')
}

const onInputBlur = () => {
  setTimeout(() => {
    isInputFocused.value = false
    document.body.classList.remove('keyboard-visible')
  }, 200)
}

const focusSearchInput = async () => {
  isInputFocused.value = true
  await navigationService.focusSearchInput()
}

const navigateToResult = (result: Datum) => {
  // Aquí puedes agregar la lógica de navegación
  console.log('Navegando a:', result)
  // Ejemplo: router.push({ name: 'media-detail', params: { slug: result.slug } })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = config.images.placeholderUrl
}

const handleLogin = () => {
  showLoginModal.value = true
}

const handleLogout = () => {
  authStore.logout()
}

const onLoginSuccess = async () => {
  await userListsStore.loadAllLists()
}

const toggleLoginModal = () => {
  showLoginModal.value = !showLoginModal.value
}
</script>

<template>
  <header class="header">
    <!-- Estado inicial: solo ícono de lupa -->
    <div v-if="!isInputFocused && !searchValue" class="header__search-icon-only" @click="focusSearchInput">
      <img
        class="header__search-icon"
        src="../temporalImgs/search.svg"
        alt="Buscar"
      />
    </div>

    <!-- Estado expandido: barra de búsqueda completa -->
    <div v-else class="header__search-container" :class="{ 'expanded': isInputFocused || searchValue }">

      <div class="header__search-icon-container">
        <img
          class="header__search-icon"
          src="../temporalImgs/search.svg"
          alt="Buscar"
        />
      </div>
      
      <input
        ref="searchInput"
        class="header__input"
        type="text"
        placeholder="Buscar películas, series..."
        v-model="searchValue"
        @focus="onInputFocus"
        @blur="onInputBlur"
      />
      
      <div class="header__search-clear" v-if="searchValue" @click="clearSearch">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>

      <!-- Resultados de búsqueda -->
      <div v-if="(isInputFocused || searchValue) && (isSearching || hasSearchResults)" class="search-results">
        <!-- Loading spinner -->
        <div v-if="isSearching" class="search-loading">
          <div class="search-spinner"></div>
          <span>Buscando...</span>
        </div>
        
        <!-- No results -->
        <div v-else-if="!hasSearchResults && !isSearching" class="search-no-results">
          No se encontraron resultados para "{{ searchValue }}"
        </div>
        
        <!-- Results list -->
        <!-- <div v-else class="search-results-list">
          <div 
            v-for="result in searchResults" 
            :key="result.id"
            class="search-result-item"
            @click="navigateToResult(result)"
          >
            <img 
              :src="result.image_url || result.thumbnail" 
              :alt="result.name"
              class="search-result-image"
              @error="handleImageError"
            />
            <div class="search-result-info">
              <h4 class="search-result-title">{{ result.name }}</h4>
              <div class="search-result-meta">
                <span class="search-result-type">
                  {{ result.type === 'movie' ? 'Película' : 'Serie' }}
                </span>
                <span v-if="result.year" class="search-result-year">{{ result.year }}</span>
              </div>
            </div>
          </div>
        </div> -->
      </div>

    </div>
    
    <!-- Botón de Login/Logout y perfil -->
    <div class="header__auth-section" :class="{ 'hidden': isInputFocused || searchValue }">
      <button 
        v-if="!authStore.isAuthenticated" 
        @click="handleLogin"
        class="header__login-btn"
      >
        Login
      </button>
      <div v-else class="header__user-section">
        <img 
          class="header__profile" 
          src="../temporalImgs/pfp.webp" 
          alt="Perfil" 
        />
        <button @click="handleLogout" class="header__logout-btn">
          Logout
        </button>
      </div>
    </div>

    <!-- Modal de Login -->
    <LoginModal 
      :show-modal="showLoginModal" 
      @close="showLoginModal = false" 
      @login-success="onLoginSuccess"
    />
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  background: rgba(44, 45, 56, 0.438);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(100px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

/* Estado inicial: solo ícono de lupa */
.header__search-icon-only {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background-color: rgba(35, 36, 42, 0.568);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.header__search-icon-only:hover {
  background-color: rgba(35, 36, 42, 0.8);
  border-color: rgba(186, 195, 255, 0.5);
  transform: scale(1.05);
}

.header__search-icon-only .header__search-icon {
  width: 20px;
  height: 20px;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

/* Sección de autenticación */
.header__auth-section {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.header__auth-section.hidden {
  display: none;
  transform: translateX(20px);
  pointer-events: none;
}

.header__login-btn {
  background: #365bfe;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.header__login-btn:hover {
  background: #2848e6;
  transform: translateY(-2px);
}

.header__user-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header__logout-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header__logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header__search-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 48px;
  width: 100%;
  background-color: rgba(35, 36, 42, 0.568);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 0 16px;
  gap: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.header__search-container:focus-within {
  background-color: rgba(35, 36, 42, 0.473);
  border-color: rgba(186, 195, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(186, 195, 255, 0.2);
  transform: translateY(-1px);
}

/* Selector de tipo de búsqueda */
.search-type-selector {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  user-select: none;
}

.search-type-selector:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.search-type-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #bfbdc2;
  white-space: nowrap;
}

.search-type-arrow {
  color: #bfbdc2;
  transition: transform 0.2s ease;
}

.search-type-arrow.rotated {
  transform: rotate(180deg);
}

.search-type-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: rgba(35, 36, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  z-index: 1001;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.search-type-option {
  padding: 8px 12px;
  font-size: 0.75rem;
  color: #bfbdc2;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-type-option:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.search-type-option.active {
  background-color: rgba(186, 195, 255, 0.2);
  color: #bac3ff;
}

.header__search-icon-container {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header__search-icon {
  width: 100%;
  height: 100%;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.header__search-container:focus-within .header__search-icon {
  opacity: 1;
}

.header__input {
  background-color: transparent;
  border: none;
  width: 100%;
  font-size: 16px;
  color: #bfbdc2;
  font-weight: 400;
  outline: none;
  padding: 0;
  line-height: 1.4;
}

.header__input::placeholder {
  color: rgba(191, 189, 194, 0.6);
  font-weight: 400;
}

.header__input:focus::placeholder {
  color: rgba(191, 189, 194, 0.8);
}

.header__search-clear {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.header__search-clear:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.header__search-clear svg {
  color: #bfbdc2;
  width: 14px;
  height: 14px;
}

/* Resultados de búsqueda */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background-color: rgba(35, 36, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  z-index: 1000;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  max-height: 400px;
  overflow-y: auto;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #bfbdc2;
  font-size: 0.9rem;
}

.search-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(186, 195, 255, 0.3);
  border-top: 2px solid #bac3ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-no-results {
  padding: 20px;
  text-align: center;
  color: #b0b0b0;
  font-size: 0.9rem;
}

.search-results-list {
  padding: 8px 0;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-result-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-image {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.1);
}

.search-result-info {
  flex: 1;
  min-width: 0;
}

.search-result-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #bfbdc2;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #b0b0b0;
}

.search-result-type {
  background-color: rgba(186, 195, 255, 0.2);
  color: #bac3ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.search-result-year::before {
  content: "•";
  margin-right: 4px;
}

.search-result-score::before {
  content: "•";
  margin-right: 4px;
}

.header__profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 1;
  transform: scale(1);
}

.header__profile.hidden {
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
  width: 0;
  height: 0;
}

.header__profile:hover {
  border-color: rgba(186, 195, 255, 0.8);
  transform: scale(1.05);
}

.header__profile.hidden:hover {
  transform: scale(0.8);
}

/* Estilos globales para cuando el teclado está visible */
:global(body.keyboard-visible) {
  padding-bottom: 0 !important;
}

:global(body.keyboard-visible .header) {
  position: fixed !important;
  top: 0 !important;
}

/* Media queries para diferentes tamaños de pantalla */
@media (max-width: 480px) {
  .header {
    padding: 10px 12px;
  }
  
  .header__search-container {
    height: 44px;
    padding: 0 14px;
    gap: 8px;
  }
  
  .header__input {
    font-size: 16px; /* Evita zoom en iOS */
  }
  
  .header__profile {
    width: 36px;
    height: 36px;
  }
  
  .search-type-text {
    font-size: 0.7rem;
  }
  
  .search-results {
    max-height: 300px;
  }
}

@media (min-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .header__search-container {
    height: 52px;
    padding: 0 20px;
    gap: 16px;
    max-width: 600px;
  }
  
  .header__input {
    font-size: 18px;
  }
  
  .header__profile {
    width: 44px;
    height: 44px;
  }
  
  .search-results {
    max-height: 500px;
  }
}

/* Animaciones suaves */
@media (prefers-reduced-motion: no-preference) {
  .header__search-container {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .header__input {
    transition: color 0.3s ease;
  }
}
</style>