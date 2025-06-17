import { onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(callback: () => void) {
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 300
    ) {
      callback()
    }
  }

  onMounted(() => window.addEventListener('scroll', handleScroll))
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
}