import api from './api';
import { useMediaStore } from '@/stores/mediaStore';
import { login } from './auth';
import { Validator } from '@/utils/validators';
import { logger } from '@/services/logger';
import type { SearchResult } from '../types/searchResult';

interface SearchParams {
  query: string
  type?: 'movies' | 'series' | 'all'
  limit?: number
  page?: number
}

export class SearchService {
  private readonly DEFAULT_LIMIT = 20
  private readonly MAX_LIMIT = 100

  private validateSearchParams(params: SearchParams): void {
    Validator.validateSearchQuery(params.query)
    
    if (params.limit) {
      Validator.validateLimit(params.limit, this.MAX_LIMIT)
    }
    
    if (params.page) {
      Validator.validatePage(params.page)
    }
  }

  private normalizeSearchType(type?: string): string {
    const typeMap: Record<string, string> = {
      'movies': 'movie',
      'series': 'series'
    }
    
    return typeMap[type || ''] || ''
  }

  private buildSearchParams(params: SearchParams): URLSearchParams {
    const searchParams = new URLSearchParams({
      query: params.query.trim(),
      limit: String(params.limit || this.DEFAULT_LIMIT),
      ...(params.page && { page: String(params.page) })
    })

    const normalizedType = this.normalizeSearchType(params.type)
    if (normalizedType) {
      searchParams.set('type', normalizedType)
    }

    return searchParams
  }

  private async ensureAuthentication(): Promise<void> {
    const mediaStore = useMediaStore()
    if (mediaStore.token === null) {
      logger.info('Token not found, authenticating...')
      const newToken = await login()
      mediaStore.token = newToken
      logger.info('Authentication successful')
    }
  }

  async searchMedia(params: SearchParams): Promise<SearchResult> {
    try {
      this.validateSearchParams(params)
      await this.ensureAuthentication()
      
      logger.info(`Performing search for "${params.query}" with type "${params.type || 'all'}"`)
      
      // Si el tipo es 'all', hacer búsquedas separadas para movies y series
      if (params.type === 'all' || !params.type) {
        const [movieResults, seriesResults] = await Promise.all([
          this.searchByType({ ...params, type: 'movies' }),
          this.searchByType({ ...params, type: 'series' })
        ])
        
        // Combinar resultados
        const combinedData = [
          ...(movieResults.data || []),
          ...(seriesResults.data || [])
        ]
        
        logger.info(`Search completed. Found ${combinedData.length} results (${movieResults.data?.length || 0} movies, ${seriesResults.data?.length || 0} series)`)
        
        return {
          status: movieResults.status || 'success',
          data: combinedData,
          links: {
            ...movieResults.links,
            total_items: (movieResults.links?.total_items || 0) + (seriesResults.links?.total_items || 0)
          }
        }
      }
      
      // Para un tipo específico, usar la búsqueda directa
      return await this.searchByType(params)
    } catch (error) {
      logger.error('Search failed:', error)
      throw error
    }
  }

  private async searchByType(params: SearchParams): Promise<SearchResult> {
    const searchParams = this.buildSearchParams(params)
    const endpoint = `search?${searchParams.toString()}`
    
    logger.info(`Searching for "${params.query}" with type "${params.type}"`)
    
    const response = await api.get<SearchResult>(endpoint)
    
    logger.info(`Search completed. Found ${response.data?.data?.length || 0} results`)
    
    return response.data
  }
}

export const searchService = new SearchService()
  
export async function searchMedia(query: string, type?: string, limit: number = 20): Promise<SearchResult> {
  return searchService.searchMedia({ query, type: type as any, limit })
}