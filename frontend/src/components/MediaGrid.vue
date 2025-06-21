<script setup lang="ts">
import CategoryItem from '@/components/CategoryItem.vue'
import { useMediaStore } from '@/stores/mediaStore'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { onMounted, computed } from 'vue'

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

onMounted(() => {
  if (items.value.length === 0) {
    loadFunction.value()
  }
})

useInfiniteScroll(loadFunction.value)

console.log(items)
</script>

<template>
  <div class="content-grid">
    <CategoryItem
      v-for="item in items"
      :key="item.id"
      :id="item.id"
      :title="item.name"
      :image="item.image"
      :rating="item.score"
      :slug="item.slug"
    />
  </div>
  <div v-if="loading" class="loading">Cargando más {{ mediaLabel }}...</div>
  <div v-if="!hasMore" class="loading">No hay más {{ mediaLabel }}.</div>
</template>

<style scoped>
.content-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-items: center;
  width: 100%;
  gap: 5px;
}

.loading {
  margin-bottom: 40px;
}
</style>