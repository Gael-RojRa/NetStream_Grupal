import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { searchMedia } from '@/services/search'
import { getRandomMovies, getRandomSeries } from '@/services/randomMedia'
import type { Datum } from '@/services/search'

export const useSearchStore = defineStore('search', () => {
  // State
  const searchResults = ref<Datum[]>([])
  const randomMovies = ref<Datum[]>([])
  const randomSeries = ref<Datum[]>([])
  const isSearching = ref(false)
  const isLoadingRandom = ref(false)
  const currentSearchQuery = ref('')
  const currentSearchType = ref<'movies' | 'series' | 'all'>('all')

  // Computed
  const hasSearchResults = computed(() => searchResults.value.length > 0)
  const hasRandomMovies = computed(() => randomMovies.value.length > 0)
  const hasRandomSeries = computed(() => randomSeries.value.length > 0)

  // Actions
  const performSearch = async (query: string, type: 'movies' | 'series' | 'all' = 'all') => {
    if (!query.trim()) {
      searchResults.value = []
      currentSearchQuery.value = ''
      currentSearchType.value = 'all'
      return
    }

    isSearching.value = true
    currentSearchQuery.value = query.trim()
    currentSearchType.value = type

    try {
      const searchType = type === 'all' ? undefined : type
      const result = await searchMedia(query.trim(), searchType, 30)
      searchResults.value = result.data
    } catch (error) {
      console.error('Error en búsqueda:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  const loadRandomMovies = async () => {
    if (hasRandomMovies.value) return // Ya tenemos datos

    isLoadingRandom.value = true
    try {
      const result = await getRandomMovies(30)
      randomMovies.value = result.data
    } catch (error) {
      console.error('Error cargando películas aleatorias:', error)
      randomMovies.value = []
    } finally {
      isLoadingRandom.value = false
    }
  }

  const loadRandomSeries = async () => {
    if (hasRandomSeries.value) return // Ya tenemos datos

    isLoadingRandom.value = true
    try {
      const result = await getRandomSeries(30)
      randomSeries.value = result.data
    } catch (error) {
      console.error('Error cargando series aleatorias:', error)
      randomSeries.value = []
    } finally {
      isLoadingRandom.value = false
    }
  }

  const clearSearch = () => {
    searchResults.value = []
    currentSearchQuery.value = ''
    currentSearchType.value = 'all'
  }

  const resetStore = () => {
    searchResults.value = []
    randomMovies.value = []
    randomSeries.value = []
    isSearching.value = false
    isLoadingRandom.value = false
    currentSearchQuery.value = ''
    currentSearchType.value = 'all'
  }

  return {
    // State
    searchResults,
    randomMovies,
    randomSeries,
    isSearching,
    isLoadingRandom,
    currentSearchQuery,
    currentSearchType,

    // Computed
    hasSearchResults,
    hasRandomMovies,
    hasRandomSeries,

    // Actions
    performSearch,
    loadRandomMovies,
    loadRandomSeries,
    clearSearch,
    resetStore
  }
}) 