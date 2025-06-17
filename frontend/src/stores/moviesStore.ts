import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchMovies } from '@/services/movies'
import type { Datum } from '@/types/movie'


export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Datum[]>([])
  const page = ref(0)
  const loading = ref(false)
  const hasMore = ref(true)

  const loadMovies = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const result = await fetchMovies(page.value)
      if (result.data.length === 0) {
        hasMore.value = false
      } else {
        movies.value.push(...result.data)
        page.value++
      }
    } catch (e) {
      hasMore.value = false
    }
    loading.value = false
  }

  return { movies, page, loading, hasMore, loadMovies }
})