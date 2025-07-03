import { ref, computed, watch, onUnmounted } from 'vue'
import { useSearchStore } from '@/stores/searchStore'
import { config } from '@/config'

export function useSearch() {
  const searchValue = ref('')
  const isInputFocused = ref(false)
  const searchTimeout = ref<number | null>(null)
  const searchStore = useSearchStore()

  const clearSearch = () => {
    searchValue.value = ''
    searchStore.clearSearch()
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
      searchTimeout.value = null
    }
  }

  const determineSearchType = (): 'movies' | 'series' | 'all' => {
    const currentPath = window.location.pathname
    if (currentPath.includes('/shows/movies')) return 'movies'
    if (currentPath.includes('/shows/series')) return 'series'
    return 'all'
  }

  const performSearch = async (query?: string) => {
    const searchQuery = query || searchValue.value.trim()
    
    if (!searchQuery) {
      searchStore.clearSearch()
      return
    }

    const searchType = determineSearchType()
    await searchStore.performSearch(searchQuery, searchType)
  }

  const debouncedSearch = () => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    
    searchTimeout.value = setTimeout(() => {
      performSearch()
    }, config.search.debounceDelay)
  }

  // Auto-búsqueda cuando cambia el valor
  watch(searchValue, () => {
    debouncedSearch()
  })

  const cleanup = () => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
      searchTimeout.value = null
    }
  }

  // Limpiar al desmontar el composable
  onUnmounted(() => {
    cleanup()
  })

  return {
    searchValue,
    isInputFocused,
    clearSearch,
    performSearch,
    cleanup,
    searchResults: computed(() => searchStore.searchResults),
    isSearching: computed(() => searchStore.isSearching),
    hasSearchResults: computed(() => searchStore.hasSearchResults)
  }
}
 