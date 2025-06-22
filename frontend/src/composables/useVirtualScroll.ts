import { ref, computed, type Ref } from 'vue'

interface VirtualScrollItem {
  id: number
  name: string
  image?: string
  score: number
  slug?: string
}

export function useVirtualScroll(items: Ref<VirtualScrollItem[]>, itemHeight = 300) {
  const containerRef = ref<HTMLElement>()
  const scrollTop = ref(0)
  const containerHeight = ref(0)
  
  const visibleStartIndex = computed(() => {
    return Math.floor(scrollTop.value / itemHeight)
  })
  
  const visibleEndIndex = computed(() => {
    return Math.min(
      visibleStartIndex.value + Math.ceil(containerHeight.value / itemHeight) + 2,
      items.value.length - 1
    )
  })
  
  const visibleItems = computed(() => {
    return items.value.slice(visibleStartIndex.value, visibleEndIndex.value + 1)
  })
  
  const totalHeight = computed(() => {
    return items.value.length * itemHeight
  })
  
  const offsetY = computed(() => {
    return visibleStartIndex.value * itemHeight
  })
  
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }
  
  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    containerHeight
  }
}