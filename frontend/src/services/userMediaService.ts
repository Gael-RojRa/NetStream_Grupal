import { fetchMovieBySlug, fetchMovieIdBySlug, fetchMovieById } from './movies';
import { fetchSerieBySlug, fetchSerieIdBySlug, fetchSerieById } from './series';
import api from './api';
import type { Movie } from '@/types/movie';
import type { Serie } from '@/types/serie';

export interface MediaItem {
  id: number;
  name: string;
  year: string;
  image: string;
  type: 'movie' | 'series';
  slug: string;
  score?: number;
}

// Cache para evitar múltiples requests de los mismos items
const mediaCache = new Map<string, MediaItem>();

export async function getMediaDetails(mediaId: number, mediaType: 'movie' | 'series'): Promise<MediaItem | null> {
  const cacheKey = `${mediaId}-${mediaType}`;
  
  // Verificar cache primero
  if (mediaCache.has(cacheKey)) {
    return mediaCache.get(cacheKey)!;
  }

  try {
    let mediaItem: MediaItem | null = null;

    if (mediaType === 'movie') {
      try {
        const movieResponse = await fetchMovieById(mediaId);
        if (movieResponse?.data) {
          const movie = movieResponse.data;
          mediaItem = {
            id: movie.id,
            name: movie.name,
            year: movie.year?.toString() || '',
            image: movie.image || '',
            type: 'movie',
            slug: movie.slug || movie.id.toString(),
            score: movie.score
          };
        }
      } catch (movieError) {
        console.error(`Movie not found with ID ${mediaId}:`, movieError);
      }
    } else {
      try {
        const serieResponse = await fetchSerieById(mediaId);
        if (serieResponse?.data) {
          const serie = serieResponse.data;
          mediaItem = {
            id: serie.id,
            name: serie.name,
            year: serie.year?.toString() || '',
            image: serie.image || '',
            type: 'series',
            slug: serie.slug || serie.id.toString(),
            score: serie.score
          };
        }
      } catch (serieError) {
        console.error(`Series not found with ID ${mediaId}:`, serieError);
      }
    }

    if (!mediaItem) {
      // Crear un item placeholder para evitar múltiples requests
      mediaItem = {
        id: mediaId,
        name: `Media ${mediaId}`,
        year: '',
        image: '/placeholder-poster.jpg',
        type: mediaType,
        slug: mediaId.toString(),
        score: 0
      };
    }

    if (mediaItem) {
      mediaCache.set(cacheKey, mediaItem);
      return mediaItem;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching media details for ID ${mediaId}:`, error);
    return null;
  }
}

export async function getMediaDetailsBatch(mediaItems: { id: number; type: 'movie' | 'series' }[]): Promise<MediaItem[]> {
  const promises = mediaItems.map(item => 
    getMediaDetails(item.id, item.type)
  );
  const results = await Promise.allSettled(promises);
  
  return results
    .filter((result): result is PromiseFulfilledResult<MediaItem> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
}

export function clearMediaCache() {
  mediaCache.clear();
}

export function getMediaFromCache(mediaId: number, mediaType: 'movie' | 'series'): MediaItem | undefined {
  return mediaCache.get(`${mediaId}-${mediaType}`);
}
