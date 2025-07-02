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
    
    return typeMap[type || ''] || 'all'
  }

  private buildSearchParams(params: SearchParams): URLSearchParams {
    return new URLSearchParams({
      query: params.query.trim(),
      type: this.normalizeSearchType(params.type),
      limit: String(params.limit || this.DEFAULT_LIMIT),
      ...(params.page && { page: String(params.page) })
    })
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
      
      const searchParams = this.buildSearchParams(params)
      const endpoint = `search?${searchParams.toString()}`
      
      logger.info(`Searching for "${params.query}" with type "${params.type || 'all'}"`)
      
      const response = await api.get<SearchResult>(endpoint)
      
      logger.info(`Search completed. Found ${response.data?.data?.length || 0} results`)
      
      return response.data
    } catch (error) {
      logger.error('Search failed:', error)
      throw error
    }
  }
}

export const searchService = new SearchService()

// Mantener compatibilidad con la función anterior
export async function searchMedia(query: string, type?: string, limit: number = 20): Promise<SearchResult> {
  return searchService.searchMedia({ query, type: type as any, limit })
}