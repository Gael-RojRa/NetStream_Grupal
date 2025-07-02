export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')
  },
  auth: {
    tokenKey: 'netstream_token'
  },
  search: {
    debounceDelay: 300,
    defaultLimit: 20,
    maxLimit: 100
  },
  images: {
    placeholderUrl: '/placeholder-image.jpg',
    defaultAvatarUrl: '/default-avatar.jpg'
  }
} as const

export type Config = typeof config
