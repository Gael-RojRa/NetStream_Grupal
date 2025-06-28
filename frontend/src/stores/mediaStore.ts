import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMediaStore = defineStore('media', () => {

  const token = ref<string | null>(null)

  return {
    token
  }
})