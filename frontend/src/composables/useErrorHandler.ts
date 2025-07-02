import { ref } from 'vue'
import { logger } from '@/services/logger'

export function useErrorHandler() {
  const errors = ref<string[]>([])

  const handleError = (error: unknown, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage
    
    errors.value.push(fullMessage)
    logger.error(fullMessage, error)
  }

  const clearErrors = () => {
    errors.value = []
  }

  const removeError = (index: number) => {
    errors.value.splice(index, 1)
  }

  return {
    errors,
    handleError,
    clearErrors,
    removeError
  }
}
