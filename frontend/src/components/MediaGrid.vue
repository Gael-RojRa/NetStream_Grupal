<script setup lang="ts">
import CategoryItem from '@/components/CategoryItem.vue';
import { useSearchStore } from '@/stores/searchStore';
import { onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

interface Props {
  mediaType: 'movies' | 'series'
}

const props = defineProps<Props>()
const searchStore = useSearchStore()
const route = useRoute()

// Computed properties para determinar qué datos mostrar
const displayItems = computed(() => {
  // Si hay resultados de búsqueda, mostrarlos
  if (searchStore.hasSearchResults) {
    return searchStore.searchResults
  }
  
  // Si no hay búsqueda, mostrar contenido aleatorio según el tipo
  if (props.mediaType === 'movies') {
    return searchStore.randomMovies
  } else {
    return searchStore.randomSeries
  }
})

const isLoading = computed(() => {
  if (searchStore.hasSearchResults) {
    return searchStore.isSearching
  }
  return searchStore.isLoadingRandom
})

const mediaLabel = computed(() =>
  props.mediaType === 'movies' ? 'películas' : 'series'
)

// Cargar contenido aleatorio cuando se monta el componente
onMounted(() => {
  if (props.mediaType === 'movies') {
    searchStore.loadRandomMovies()
  } else {
    searchStore.loadRandomSeries()
  }
})

// Observar cambios en la ruta para limpiar búsquedas cuando se cambia de tab
watch(() => route.path, () => {
  searchStore.clearSearch()
}, { immediate: true })

</script>

<template>
  <div v-if="isLoading && displayItems.length === 0" class="initial-loading">
    <div class="loading-grid">
      <div v-for="n in 12" :key="n" class="loading-item">
        <div class="loading-image"></div>
        <div class="loading-title"></div>
      </div>
    </div>
  </div>

  <div v-else class="content-container">
    <!-- Mostrar título de búsqueda si hay resultados -->
    <div v-if="searchStore.hasSearchResults" class="search-results-header">
      <h3>Resultados de búsqueda para "{{ searchStore.currentSearchQuery }}"</h3>
      <p>{{ displayItems.length }} {{ mediaLabel }} encontradas</p>
    </div>

    <!-- Mostrar título de contenido aleatorio si no hay búsqueda -->
    <div v-else-if="displayItems.length > 0" class="random-content-header">
      <h3>{{ mediaLabel.charAt(0).toUpperCase() + mediaLabel.slice(1) }} recomendadas</h3>
    </div>

    <div class="content-grid">
      <CategoryItem 
        v-for="item in displayItems" 
        :key="item.id" 
        :id="item.id" 
        :title="item.name" 
        :image="item.image_url"
        :rating="5" 
        :slug="item.slug" 
        :media-type="props.mediaType" 
      />
    </div>

    <!-- Estado vacío cuando no hay resultados -->
    <div v-if="!isLoading && displayItems.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3 class="empty-title">
        {{ searchStore.hasSearchResults ? 'No se encontraron resultados' : `No hay ${mediaLabel} disponibles` }}
      </h3>
      <p class="empty-description">
        {{ searchStore.hasSearchResults 
          ? `No se encontraron ${mediaLabel} que coincidan con "${searchStore.currentSearchQuery}"` 
          : `Por el momento no hay ${mediaLabel} para mostrar. Intenta más tarde.` 
        }}
      </p>
    </div>
  </div>
</template>

<style>
.content-container {
  width: 100%;
}

.scroller {
  height: 100%;
  align-items: center;
  justify-content: center;
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

.search-results-header,
.random-content-header {
  padding: 0 0 12px 0 ;
  text-align: left;
}

.search-results-header h3,
.random-content-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #bfbdc2;
}

.search-results-header p,
.random-content-header p {
  font-size: 0.9rem;
  color: #b0b0b0;
  margin: 0;
}

.initial-loading {
  width: 100%;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 6px;
  width: 100%;
}

.loading-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: pulse 2s ease-in-out infinite;
}

.loading-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 10px;
}

.loading-title {
  width: 80%;
  height: 16px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

.load-more-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 30px;
  margin-top: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #3a3b47;
  border-top: 3px solid #bac3ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #b0b0b0;
  font-size: 0.9rem;
  font-weight: 500;
}

.no-more-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px;
  margin-top: 20px;
}

.no-more-icon {
  font-size: 2.5rem;
  opacity: 0.7;
}

.no-more-text {
  color: #b0b0b0;
  font-size: 0.9rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 50vh;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-title {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #bfbdc2;
}

.empty-description {
  color: #b0b0b0;
  font-size: 0.9rem;
  max-width: 300px;
  line-height: 1.4;
}
</style>