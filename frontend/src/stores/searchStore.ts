import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { searchService } from '@/services/search'
import { getRandomMovies, getRandomSeries } from '@/services/randomMedia'
import { logger } from '@/services/logger'
import type { Datum } from '@/types/searchResult'

interface SearchState {
  currentQuery: string
  currentType: 'movies' | 'series' | 'all'
  results: Datum[]
  isLoading: boolean
  error: string | null
  lastSearchTime: number
}

export const useSearchStore = defineStore('search', () => {
  // State
  const searchResults = ref<Datum[]>([])
  const randomMovies = ref<Datum[]>([])
  const randomSeries = ref<Datum[]>([])
  const isSearching = ref(false)
  const isLoadingRandom = ref(false)
  const currentSearchQuery = ref('')
  const currentSearchType = ref<'movies' | 'series' | 'all'>('all')
  const searchError = ref<string | null>(null)
  const lastSearchTime = ref(0)

  // Computed
  const hasSearchResults = computed(() => searchResults.value.length > 0)
  const hasRandomMovies = computed(() => randomMovies.value.length > 0)
  const hasRandomSeries = computed(() => randomSeries.value.length > 0)
  const hasError = computed(() => !!searchError.value)
  const isEmpty = computed(() => !isSearching.value && !hasSearchResults.value && !hasError.value)

  // Actions
  const performSearch = async (query: string, type: 'movies' | 'series' | 'all' = 'all') => {
    if (!query.trim()) {
      clearSearch()
      return
    }

    // Evitar búsquedas duplicadas
    if (currentSearchQuery.value === query && currentSearchType.value === type && !hasError.value) {
      return
    }

    try {
      isSearching.value = true
      searchError.value = null
      currentSearchQuery.value = query.trim()
      currentSearchType.value = type
      lastSearchTime.value = Date.now()

      logger.info(`Performing search for "${query}" with type "${type}"`)

      const searchType = type === 'all' ? undefined : type
      const result = await searchService.searchMedia({
        query: query.trim(),
        type: searchType,
        limit: 10
      })

      searchResults.value = result.data || []
      
      logger.info(`Search completed. Found ${searchResults.value.length} results`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la búsqueda'
      searchError.value = errorMessage
      searchResults.value = []
      
      logger.error('Search failed:', error)
    } finally {
      isSearching.value = false
    }
  }

  const loadRandomMovies = async () => {
    if (hasRandomMovies.value) return // Ya tenemos datos

    isLoadingRandom.value = true
    try {
      logger.info('Loading random movies...')
      const result = await getRandomMovies(10)
      randomMovies.value = result.data
      logger.info(`Loaded ${randomMovies.value.length} random movies`)
    } catch (error) {
      logger.error('Error loading random movies:', error)
      randomMovies.value = []
    } finally {
      isLoadingRandom.value = false
    }
  }

  const loadRandomSeries = async () => {
    if (hasRandomSeries.value) return // Ya tenemos datos

    isLoadingRandom.value = true
    try {
      logger.info('Loading random series...')
      const result = await getRandomSeries(10)
      randomSeries.value = result.data
      logger.info(`Loaded ${randomSeries.value.length} random series`)
    } catch (error) {
      logger.error('Error loading random series:', error)
      randomSeries.value = []
    } finally {
      isLoadingRandom.value = false
    }
  }

  const clearSearch = () => {
    searchResults.value = []
    currentSearchQuery.value = ''
    currentSearchType.value = 'all'
    searchError.value = null
  }

  const retryLastSearch = () => {
    if (currentSearchQuery.value) {
      performSearch(currentSearchQuery.value, currentSearchType.value)
    }
  }

  const resetStore = () => {
    searchResults.value = []
    randomMovies.value = []
    randomSeries.value = []
    isSearching.value = false
    isLoadingRandom.value = false
    currentSearchQuery.value = ''
    currentSearchType.value = 'all'
    searchError.value = null
    lastSearchTime.value = 0
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
    hasError,
    isEmpty,
    error: computed(() => searchError.value),

    // Actions
    performSearch,
    loadRandomMovies,
    loadRandomSeries,
    clearSearch,
    retryLastSearch,
    resetStore
  }
}) 