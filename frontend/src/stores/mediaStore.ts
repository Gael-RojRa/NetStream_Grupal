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
    
    const result = await moviesState.handleAsyncOperation(
      () => fetchMovies(moviesPage.value),
      'Error al cargar películas'
    )

    if (result) {
      if (result.data.length === 0) {
        moviesState.setHasMore(false)
      } else {
        movies.value.push(...result.data)
        moviesPage.value++
      }
    } else {
      moviesState.setHasMore(false)
    }
  }

  const loadSeries = async () => {
    if (seriesState.loading.value || !seriesState.hasMore.value) return
    
    const result = await seriesState.handleAsyncOperation(
      () => fetchSeries(seriesPage.value),
      'Error al cargar series'
    )

    if (result) {
      if (result.data.length === 0) {
        seriesState.setHasMore(false)
      } else {
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
    moviesState.resetState()
  }

  const resetSeries = () => {
    series.value = []
    seriesPage.value = 1
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