<script setup lang="ts">
import MovieCard from '@/components/CategoryItem.vue'
import { useMoviesStore } from '@/stores/moviesStore'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { onMounted } from 'vue'

const moviesStore = useMoviesStore()

onMounted(() => {
  if (moviesStore.movies.length === 0) {
    moviesStore.loadMovies()
    
  }
})


useInfiniteScroll(moviesStore.loadMovies)
</script>

<template>
  <div class="content-grid">
    <MovieCard
      v-for="movie in moviesStore.movies"
      :key="movie.id"
      :title="movie.name"
      :image="movie.image"
      :rating="movie.score"
    />
  </div>
  <div v-if="moviesStore.loading" class="loading">Cargando más películas...</div>
  <div v-if="!moviesStore.hasMore" class="loading">No hay más películas.</div>
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