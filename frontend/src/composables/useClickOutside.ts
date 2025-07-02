import { ref, onMounted, onUnmounted } from 'vue'

export function useClickOutside(callback: () => void, selectors: string[] = []) {
  const isActive = ref(true)

  const handleClickOutside = (event: Event) => {
    if (!isActive.value) return

    const target = event.target as HTMLElement
    const isOutside = selectors.every(selector => !target.closest(selector))
    
    if (isOutside) {
      callback()
    }
  }

  const activate = () => {
    isActive.value = true
  }

  const deactivate = () => {
    isActive.value = false
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    activate,
    deactivate
  }
}
