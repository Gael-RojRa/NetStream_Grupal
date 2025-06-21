import { ref } from 'vue'

export interface LoadingState {
  loading: boolean
  error: string | null
  hasMore: boolean
}

export function useLoadingState() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const setHasMore = (value: boolean) => {
    hasMore.value = value
  }

  const resetState = () => {
    loading.value = false
    error.value = null
    hasMore.value = true
  }

  const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await operation()
      return result
    } catch (err) {
      console.error(err)
      setError(errorMessage || 'Ocurrió un error inesperado')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    hasMore,
    setLoading,
    setError,
    setHasMore,
    resetState,
    handleAsyncOperation
  }
}