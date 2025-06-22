import { onMounted, onUnmounted, ref } from 'vue'

export function useInfiniteScroll(callback: () => void, threshold = 800, container?: () => HTMLElement | null) {
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
      const element = container?.() || document.documentElement
      const scrollHeight = element.scrollHeight
      const scrollTop = element.scrollTop
      const clientHeight = element.clientHeight
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        throttledCallback()
      }
    }, 150) as unknown as number
  }

  onMounted(() => {
    const scrollElement = container?.() || window
    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
  })
  
  onUnmounted(() => {
    const scrollElement = container?.() || window
    scrollElement.removeEventListener('scroll', handleScroll)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  })

  return { isLoading }
}