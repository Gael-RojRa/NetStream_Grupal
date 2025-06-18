import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchSeries } from '@/services/series'
import type { Datum } from '@/types/serie'


export const useSeriesStore = defineStore('series', () => {
  const series = ref<Datum[]>([])
  const page = ref(0)
  const loading = ref(false)
  const hasMore = ref(true)
  const token = ref<string | null>(null)

  const loadSeries = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const result = await fetchSeries(page.value)
      if (result.data.length === 0) {
        hasMore.value = false
      } else {
        series.value.push(...result.data)
        page.value++
      }
    } catch (e) {
      hasMore.value = false
    }
    loading.value = false
  }

  return { token, series, page, loading, hasMore, loadSeries }
})