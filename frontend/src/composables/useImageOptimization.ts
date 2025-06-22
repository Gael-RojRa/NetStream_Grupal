
export function useImageOptimization() {
  const imageCache = new Map<string, string>()
  
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (imageCache.has(src)) {
        resolve()
        return
      }
      
      const img = new Image()
      img.onload = () => {
        imageCache.set(src, src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  const isImageCached = (src: string): boolean => {
    return imageCache.has(src)
  }

  const clearCache = () => {
    imageCache.clear()
  }

  return {
    preloadImage,
    isImageCached,
    clearCache
  }
}