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

      let allResults: Datum[] = []

      if (type === 'all') {
        // Buscar en ambos tipos cuando es 'all'
        const [moviesResult, seriesResult] = await Promise.allSettled([
          searchService.searchMedia({
            query: query.trim(),
            type: 'movies',
            limit: 5
          }),
          searchService.searchMedia({
            query: query.trim(),
            type: 'series',
            limit: 5
          })
        ])

        // Combinar resultados exitosos
        if (moviesResult.status === 'fulfilled' && moviesResult.value.data) {
          allResults = [...allResults, ...moviesResult.value.data]
        }
        if (seriesResult.status === 'fulfilled' && seriesResult.value.data) {
          allResults = [...allResults, ...seriesResult.value.data]
        }

        // Si ambas búsquedas fallaron, lanzar error
        if (moviesResult.status === 'rejected' && seriesResult.status === 'rejected') {
          throw new Error('No se pudieron buscar películas ni series')
        }
      } else {
        // Búsqueda específica por tipo
        const result = await searchService.searchMedia({
          query: query.trim(),
          type: type,
          limit: 10
        })
        allResults = result.data || []
      }

      searchResults.value = allResults
      
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

  const loadRandomMovies = async (loadMore: boolean = false) => {
    if (hasRandomMovies.value && !loadMore) return // Ya tenemos datos

    isLoadingRandom.value = true
    try {
      logger.info('Loading random movies...')
      const result = await getRandomMovies(20) // Cargar 20 siempre
      
      if (loadMore) {
        // Agregar nuevos resultados a los existentes
        randomMovies.value = [...randomMovies.value, ...result.data]
      } else {
        // Reemplazar resultados existentes
        randomMovies.value = result.data
      }
      
      logger.info(`Loaded ${result.data.length} random movies. Total: ${randomMovies.value.length}`)
    } catch (error) {
      logger.error('Error loading random movies:', error)
      if (!loadMore) {
        randomMovies.value = []
      }
    } finally {
      isLoadingRandom.value = false
    }
  }

  const loadRandomSeries = async (loadMore: boolean = false) => {
    if (hasRandomSeries.value && !loadMore) return // Ya tenemos datos

    isLoadingRandom.value = true
    try {
      logger.info('Loading random series...')
      const result = await getRandomSeries(20) // Cargar 20 siempre
      
      if (loadMore) {
        // Agregar nuevos resultados a los existentes
        randomSeries.value = [...randomSeries.value, ...result.data]
      } else {
        // Reemplazar resultados existentes
        randomSeries.value = result.data
      }
      
      logger.info(`Loaded ${result.data.length} random series. Total: ${randomSeries.value.length}`)
    } catch (error) {
      logger.error('Error loading random series:', error)
      if (!loadMore) {
        randomSeries.value = []
      }
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

  const loadMoreRandomContent = async (type: 'movies' | 'series') => {
    if (type === 'movies') {
      await loadRandomMovies(true)
    } else {
      await loadRandomSeries(true)
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
    loadMoreRandomContent,
    clearSearch,
    retryLastSearch,
    resetStore
  }
}) 