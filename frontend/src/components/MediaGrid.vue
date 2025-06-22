<script setup lang="ts">
import CategoryItem from '@/components/CategoryItem.vue'
import { useMediaStore } from '@/stores/mediaStore'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useVirtualList } from '@vueuse/core'
import { onMounted, computed, ref, nextTick } from 'vue'

interface Props {
  mediaType: 'movies' | 'series'
}

const props = defineProps<Props>()
const mediaStore = useMediaStore()

const items = computed(() => 
  props.mediaType === 'movies' ? mediaStore.movies : mediaStore.series
)

const loading = computed(() => 
  props.mediaType === 'movies' ? mediaStore.moviesLoading : mediaStore.seriesLoading
)

const hasMore = computed(() => 
  props.mediaType === 'movies' ? mediaStore.moviesHasMore : mediaStore.seriesHasMore
)

const loadFunction = computed(() => 
  props.mediaType === 'movies' ? mediaStore.loadMovies : mediaStore.loadSeries
)

const mediaLabel = computed(() => 
  props.mediaType === 'movies' ? 'películas' : 'series'
)

// Configuración para el grid virtual
const containerRef = ref<HTMLElement>()
const itemHeight = 285 // Altura aproximada de cada item (imagen + título)
const gap = 6 // Gap entre items
const containerWidth = ref(0)
const itemsPerRow = ref(1)

// Calcular cuántos items caben por fila
const updateItemsPerRow = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth
    const minItemWidth = 145 // minmax del grid CSS
    itemsPerRow.value = Math.floor(containerWidth.value / (minItemWidth + gap))
  }
}

// Crear chunks de items para el grid
const itemChunks = computed(() => {
  const chunks = []
  const itemsArray = items.value
  
  for (let i = 0; i < itemsArray.length; i += itemsPerRow.value) {
    chunks.push(itemsArray.slice(i, i + itemsPerRow.value))
  }
  
  return chunks
})

// Configurar virtualización
const { list, containerProps, wrapperProps } = useVirtualList(
  itemChunks,
  {
    itemHeight: itemHeight + gap,
    overscan: 5,
  }
)

// Detectar cuando estamos cerca del final para cargar más items
const handleScroll = () => {
  if (!containerRef.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  const threshold = 600
  
  if (scrollTop + clientHeight >= scrollHeight - threshold && hasMore.value && !loading.value) {
    loadFunction.value()
  }
}

onMounted(async () => {
  if (items.value.length === 0) {
    await loadFunction.value()
  }
  
  await nextTick()
  updateItemsPerRow()
  
  // Observer para detectar cambios de tamaño
  const resizeObserver = new ResizeObserver(() => {
    updateItemsPerRow()
  })
  
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }

  // Configurar infinite scroll para la lista virtual
  const virtualListElement = containerRef.value?.querySelector('.virtual-list-container')
  if (virtualListElement) {
    const { isLoading } = useInfiniteScroll(
      loadFunction.value,
      600,
      () => virtualListElement as HTMLElement
    )
  } else {
    // Fallback para la lista normal
    useInfiniteScroll(loadFunction.value, 600)
  }
})

console.log(items)
</script>

<template>
  <div v-if="loading && items.length === 0" class="initial-loading">
    <div class="loading-grid">
      <div 
        v-for="n in 12" 
        :key="n"
        class="loading-item"
      >
        <div class="loading-image"></div>
        <div class="loading-title"></div>
      </div>
    </div>
  </div>

  <div v-else class="content-container" ref="containerRef">
    <!-- Lista virtual para items de gran cantidad -->
    <div 
      v-if="items.length > 50"
      class="virtual-list-container"
      v-bind="containerProps"
    >
      <div v-bind="wrapperProps">
        <div
          v-for="{ data, index } in list"
          :key="index"
          class="virtual-row"
        >
          <div class="content-grid">
            <CategoryItem
              v-for="item in data"
              :key="`${item.id}-${item.name}`"
              :id="item.id"
              :title="item.name"
              :image="item.image"
              :rating="item.score"
              :slug="item.slug"
              :media-type="props.mediaType"
              v-memo="[item.id, item.name, item.image, item.score]"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Grid simple para pocos items -->
    <div v-else class="content-grid">
      <CategoryItem
        v-for="item in items"
        :key="`${item.id}-${item.name}`"
        :id="item.id"
        :title="item.name"
        :image="item.image"
        :rating="item.score"
        :slug="item.slug"
        :media-type="props.mediaType"
        v-memo="[item.id, item.name, item.image, item.score]"
      />
    </div>
    
    <div v-if="loading && items.length > 0" class="load-more-loading">
      <div class="spinner"></div>
      <span class="loading-text">Cargando más {{ mediaLabel }}...</span>
    </div>
    
    <div v-if="!hasMore && items.length > 0" class="no-more-content">
      <div class="no-more-icon">📺</div>
      <span class="no-more-text">No hay más {{ mediaLabel }} disponibles</span>
    </div>
    
    <div v-if="!loading && items.length === 0" class="empty-state">
      <div class="empty-icon">🎬</div>
      <h3 class="empty-title">No se encontraron {{ mediaLabel }}</h3>
      <p class="empty-description">Intenta recargar la página o vuelve más tarde</p>
    </div>
  </div>
</template>

<style scoped>
.content-container {
  width: 100%;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 6px;
  width: 100%;
}

/* Estilos para lista virtual */
.virtual-list-container {
  width: 100%;
  height: 70vh;
  overflow: auto;
}

.virtual-row {
  width: 100%;
}

.virtual-row .content-grid {
  padding: 3px 0;
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
  0%, 100% {
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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