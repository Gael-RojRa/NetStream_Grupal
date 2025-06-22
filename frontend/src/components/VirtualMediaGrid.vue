<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import CategoryItem from '@/components/CategoryItem.vue'
import { useMediaStore } from '@/stores/mediaStore'
import { onMounted, computed, watch, ref } from 'vue'
import { useDebounceFn, useWindowSize } from '@vueuse/core'

interface Props {
  mediaType: 'movies' | 'series'
}

const props = defineProps<Props>()
const mediaStore = useMediaStore()

// Window size for responsive calculations
const { width } = useWindowSize()

// Responsive grid calculations
const itemWidth = computed(() => {
  if (width.value >= 1200) return 180
  if (width.value >= 768) return 160
  if (width.value >= 480) return 145
  return 130
})

const itemsPerRow = computed(() => {
  const containerWidth = width.value - 32 // padding
  return Math.floor(containerWidth / itemWidth.value)
})

const itemHeight = computed(() => {
  const imageHeight = itemWidth.value * 1.5 // 3:2 aspect ratio
  const titleHeight = 50
  const padding = 20
  return imageHeight + titleHeight + padding
})

// Media items
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

// Convert items to rows for virtual scrolling
const rows = computed(() => {
  const itemsData = items.value
  const perRow = itemsPerRow.value
  const rowsArray = []
  
  for (let i = 0; i < itemsData.length; i += perRow) {
    rowsArray.push({
      id: `row-${i}`,
      items: itemsData.slice(i, i + perRow)
    })
  }
  
  return rowsArray
})

// Debounced load more function
const debouncedLoadMore = useDebounceFn(() => {
  if (!loading.value && hasMore.value) {
    loadFunction.value()
  }
}, 300)

// Handle reaching end of list
const handleReachEnd = () => {
  debouncedLoadMore()
}

// Initial load
onMounted(() => {
  if (items.value.length === 0) {
    loadFunction.value()
  }
})

// Watch for scroll end
const scrollContainer = ref<InstanceType<typeof RecycleScroller> | null>(null)

watch(rows, () => {
  // Trigger load more when we're getting close to the end
  if (rows.value.length > 0 && hasMore.value && !loading.value) {
    // Check if we need more items to fill the screen
    const visibleRows = Math.ceil(window.innerHeight / itemHeight.value) + 2
    if (rows.value.length <= visibleRows) {
      debouncedLoadMore()
    }
  }
})
</script>

<template>
  <div class="virtual-media-grid">
    <!-- Initial loading state -->
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

    <!-- Main content with virtual scrolling -->
    <div v-else class="content-container">
      <RecycleScroller
        ref="scrollContainer"
        v-if="rows.length > 0"
        class="scroller"
        :items="rows"
        :item-size="itemHeight"
        key-field="id"
        @scroll-end="handleReachEnd"
        v-slot="{ item }"
      >
        <div class="media-row">
          <CategoryItem
            v-for="mediaItem in item.items"
            :key="`${mediaItem.id}-${mediaItem.name}`"
            :id="mediaItem.id"
            :title="mediaItem.name"
            :image="mediaItem.image"
            :rating="mediaItem.score"
            :slug="mediaItem.slug"
            :media-type="props.mediaType"
            class="media-item"
            :style="{ width: `${itemWidth}px` }"
          />
        </div>
      </RecycleScroller>
      
      <!-- Loading more indicator -->
      <div v-if="loading && items.length > 0" class="load-more-loading">
        <div class="spinner"></div>
        <span class="loading-text">Cargando más {{ mediaLabel }}...</span>
      </div>
      
      <!-- No more content -->
      <div v-if="!hasMore && items.length > 0" class="no-more-content">
        <div class="no-more-icon">📺</div>
        <span class="no-more-text">No hay más {{ mediaLabel }} disponibles</span>
      </div>
      
      <!-- Empty state -->
      <div v-if="!loading && items.length === 0" class="empty-state">
        <div class="empty-icon">🎬</div>
        <h3 class="empty-title">No se encontraron {{ mediaLabel }}</h3>
        <p class="empty-description">Intenta recargar la página o vuelve más tarde</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-media-grid {
  width: 100%;
  height: 100%;
}

.content-container {
  width: 100%;
  height: calc(100vh - 140px); /* Account for header and nav */
}

.scroller {
  height: 100%;
  width: 100%;
}

.media-row {
  display: flex;
  flex-direction: row;
  gap: 6px;
  padding: 3px 0;
  justify-content: flex-start;
  align-items: flex-start;
}

.media-item {
  flex-shrink: 0;
}

/* Loading states */
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