import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchMovies } from '@/services/movies'
import { fetchSeries } from '@/services/series'
import type { Datum as MovieDatum } from '@/types/movie'
import type { Datum as SerieDatum } from '@/types/serie'

export const useMediaStore = defineStore('media', () => {
  const movies = ref<MovieDatum[]>([])
  const series = ref<SerieDatum[]>([])
  const moviesPage = ref(1)
  const seriesPage = ref(1)
  const moviesLoading = ref(false)
  const seriesLoading = ref(false)
  const moviesHasMore = ref(true)
  const seriesHasMore = ref(true)
  const token = ref<string | null>(null)

  const loadMovies = async () => {
    if (moviesLoading.value || !moviesHasMore.value) return
    
    moviesLoading.value = true
    try {
      const result = await fetchMovies(moviesPage.value)
      if (result.data.length === 0) {
        moviesHasMore.value = false
      } else {
        movies.value.push(...result.data)
        moviesPage.value++
      }
    } catch (e) {
      moviesHasMore.value = false
    }
    moviesLoading.value = false
  }

  const loadSeries = async () => {
    if (seriesLoading.value || !seriesHasMore.value) return
    
    seriesLoading.value = true
    try {
      const result = await fetchSeries(seriesPage.value)
      if (result.data.length === 0) {
        seriesHasMore.value = false
      } else {
        series.value.push(...result.data)
        seriesPage.value++
      }
    } catch (e) {
      seriesHasMore.value = false
    }
    seriesLoading.value = false
  }

  return {
    token,
    movies,
    series,
    moviesLoading,
    seriesLoading,
    moviesHasMore,
    seriesHasMore,
    loadMovies,
    loadSeries,
    moviesPage,
    seriesPage
  }
})