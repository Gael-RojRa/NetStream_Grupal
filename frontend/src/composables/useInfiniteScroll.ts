import { onMounted, onUnmounted, ref } from 'vue'

export function useInfiniteScroll(callback: () => void, threshold = 800) {
  const isLoading = ref(false)
  let timeoutId: number | null = null
  let isThrottled = false

  const throttledCallback = async () => {
    if (isLoading.value || isThrottled) return
    
    isThrottled = true
    isLoading.value = true
    
    try {
      await callback()
    } finally {
      isLoading.value = false
      // Throttle for 200ms to prevent excessive calls
      setTimeout(() => {
        isThrottled = false
      }, 200)
    }
  }

  const handleScroll = () => {
    // Cancel previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // Debounce scroll events
    timeoutId = setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        throttledCallback()
      }
    }, 150) as unknown as number
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  })

  return { isLoading }
}