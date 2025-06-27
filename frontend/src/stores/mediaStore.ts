import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchMovies } from '@/services/movies'
import { fetchSeries } from '@/services/series'
import type { Datum as MovieDatum } from '@/types/movie'
import type { Datum as SerieDatum } from '@/types/serie'
import { useLoadingState } from '@/composables/useLoadingState'

export const useMediaStore = defineStore('media', () => {
  // State
  const movies = ref<MovieDatum[]>([])
  const series = ref<SerieDatum[]>([])
  const moviesPage = ref(1)
  const seriesPage = ref(1)
  const token = ref<string | null>(null)
  
  // Cache para evitar requests duplicados
  const moviesCache = new Map<number, MovieDatum[]>()
  const seriesCache = new Map<number, SerieDatum[]>()

  // Loading states using composable
  const moviesState = useLoadingState()
  const seriesState = useLoadingState()

  // Computed getters for easier access
  const moviesLoading = moviesState.loading
  const seriesLoading = seriesState.loading
  const moviesHasMore = moviesState.hasMore
  const seriesHasMore = seriesState.hasMore

  const loadMovies = async () => {
    if (moviesState.loading.value || !moviesState.hasMore.value) return
    
    // Verificar cache primero
    if (moviesCache.has(moviesPage.value)) {
      const cachedData = moviesCache.get(moviesPage.value)!
      movies.value.push(...cachedData)
      moviesPage.value++
      return
    }
    
    const result = await moviesState.handleAsyncOperation(
      () => fetchMovies(moviesPage.value),
      'Error al cargar películas'
    )

    if (result) {
      if (result.data.length === 0) {
        moviesState.setHasMore(false)
      } else {
        moviesCache.set(moviesPage.value, result.data)
        movies.value.push(...result.data)
        moviesPage.value++
      }
    } else {
      moviesState.setHasMore(false)
    }
  }

  const loadSeries = async () => {
    if (seriesState.loading.value || !seriesState.hasMore.value) return
    
    if (seriesCache.has(seriesPage.value)) {
      const cachedData = seriesCache.get(seriesPage.value)!
      series.value.push(...cachedData)
      seriesPage.value++
      return
    }
    
    const result = await seriesState.handleAsyncOperation(
      () => fetchSeries(seriesPage.value),
      'Error al cargar series'
    )

    if (result) {
      if (result.data.length === 0) {
        seriesState.setHasMore(false)
      } else {
        // Guardar en cache
        seriesCache.set(seriesPage.value, result.data)
        series.value.push(...result.data)
        seriesPage.value++
      }
    } else {
      seriesState.setHasMore(false)
    }
  }

  const resetMovies = () => {
    movies.value = []
    moviesPage.value = 1
    moviesCache.clear()
    moviesState.resetState()
  }

  const resetSeries = () => {
    series.value = []
    seriesPage.value = 1
    seriesCache.clear()
    seriesState.resetState()
  }

  return {
    // State
    token,
    movies,
    series,
    moviesPage,
    seriesPage,
    
    // Loading states
    moviesLoading,
    seriesLoading,
    moviesHasMore,
    seriesHasMore,
    
    // Actions
    loadMovies,
    loadSeries,
    resetMovies,
    resetSeries
  }
})