export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class Validator {
  static validateSlug(slug: string): string {
    if (!slug || typeof slug !== 'string') {
      throw new ValidationError('Slug is required and must be a string')
    }
    
    const sanitized = slug.trim().toLowerCase()
    if (!sanitized) {
      throw new ValidationError('Slug cannot be empty')
    }
    
    return sanitized
  }

  static validateSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Search query is required')
    }
    
    const sanitized = query.trim()
    if (sanitized.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters')
    }
    
    return sanitized
  }

  static validateLimit(limit: number, maxLimit: number = 100): number {
    if (typeof limit !== 'number' || limit < 1 || limit > maxLimit) {
      throw new ValidationError(`Limit must be between 1 and ${maxLimit}`)
    }
    return limit
  }

  static validatePage(page: number): number {
    if (typeof page !== 'number' || page < 1) {
      throw new ValidationError('Page must be greater than 0')
    }
    return page
  }
}
