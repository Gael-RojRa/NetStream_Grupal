<script setup lang="ts">
import SerieCard from '@/components/CategoryItem.vue'
import { useSeriesStore } from '@/stores/seriesStore'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { onMounted } from 'vue'

const seriesStore = useSeriesStore()

onMounted(() => {
  if (seriesStore.series.length === 0) {
    seriesStore.loadSeries()
    
  }
})


useInfiniteScroll(seriesStore.loadSeries)
</script>

<template>
  <div class="content-grid">
    <SerieCard
      v-for="serie in seriesStore.series"
      :key="serie.id"
      :title="serie.name"
      :image="serie.image"
      :rating="serie.score"
    />
  </div>
  <div v-if="seriesStore.loading" class="loading">Cargando más películas...</div>
  <div v-if="!seriesStore.hasMore" class="loading">No hay más películas.</div>
</template>

<style scoped>

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(162px, 1fr));
  align-items: center;
  justify-items: center;
  width: 100%;
  gap: 5px;
}

.loading {
  margin-bottom: 40px;
}
</style>