import { ref, onMounted, onUnmounted } from 'vue'

export function useKeyboardManager() {
  const isKeyboardVisible = ref(false)

  const handleViewportChange = () => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight
    const windowHeight = window.screen.height
    
    const shouldShowKeyboard = viewportHeight < windowHeight * 0.75
    isKeyboardVisible.value = shouldShowKeyboard
    
    if (shouldShowKeyboard) {
      document.body.classList.add('keyboard-visible')
    } else {
      document.body.classList.remove('keyboard-visible')
    }
  }

  const initializeKeyboardDetection = () => {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
    }
  }

  const cleanupKeyboardDetection = () => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportChange)
    }
    document.body.classList.remove('keyboard-visible')
  }

  onMounted(initializeKeyboardDetection)
  onUnmounted(cleanupKeyboardDetection)

  return {
    isKeyboardVisible,
    handleViewportChange
  }
}
