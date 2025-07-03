const isProduction = import.meta.env.PROD
const isDevelopment = import.meta.env.DEV

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || (
      isProduction 
        ? 'https://api4.thetvdb.com/v4' 
        : 'http://localhost:8000/api'
    ),
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')
  },
  backend: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || (
      isProduction 
        ? 'https://tu-backend-desplegado.vercel.app' 
        : 'http://localhost:3000'
    )
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
  },
  environment: {
    isProduction,
    isDevelopment,
    mode: import.meta.env.MODE
  }
} as const

export type Config = typeof config
