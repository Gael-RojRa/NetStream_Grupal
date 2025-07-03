import axios, { AxiosError, type AxiosResponse } from 'axios'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: AxiosError
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiService {
  private baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

  private handleError(error: AxiosError): never {
    console.error('API Error:', error)
    
    if (error.response) {
      const errorData = error.response.data as any
      throw new ApiError(
        `API Error: ${errorData?.message || error.message}`,
        error.response.status,
        error
      )
    } else if (error.request) {
      throw new ApiError('Network Error: No response received', undefined, error)
    } else {
      throw new ApiError(`Request Error: ${error.message}`, undefined, error)
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      console.debug(`GET request to: ${this.baseURL}/${endpoint}`)
      const response: AxiosResponse<T> = await axios.get(`${this.baseURL}/${endpoint}`)
      return response.data
    } catch (error) {
      this.handleError(error as AxiosError)
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.debug(`POST request to: ${this.baseURL}/${endpoint}`)
      const response: AxiosResponse<T> = await axios.post(`${this.baseURL}/${endpoint}`, data)
      return response.data
    } catch (error) {
      this.handleError(error as AxiosError)
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.debug(`PUT request to: ${this.baseURL}/${endpoint}`)
      const response: AxiosResponse<T> = await axios.put(`${this.baseURL}/${endpoint}`, data)
      return response.data
    } catch (error) {
      this.handleError(error as AxiosError)
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      console.debug(`DELETE request to: ${this.baseURL}/${endpoint}`)
      const response: AxiosResponse<T> = await axios.delete(`${this.baseURL}/${endpoint}`)
      return response.data
    } catch (error) {
      this.handleError(error as AxiosError)
    }
  }
}

export const apiService = new ApiService()
