
const BASE_IMAGE_URL = 'https://artworks.thetvdb.com';

export function processImageUrl(url: string | null | undefined): string | null {
  if (!url) return 'https://artworks.thetvdb.com/banners/images/missing/series.jpg';
  
  if (url.startsWith('http')) {
    return url;
  }
  
  const newUrl = `${BASE_IMAGE_URL}${url}`
  return newUrl
}

export function processMediaItem<T extends Record<string, any>>(item: T): T {
  return {
    ...item,
    image: processImageUrl(item.image),
    image_url: processImageUrl(item.image_url),
    poster: processImageUrl(item.poster),
    backdrop: processImageUrl(item.backdrop),
  };
}

export function processMediaArray<T extends Record<string, any>>(items: T[]): T[] {
  return items.map(processMediaItem);
}