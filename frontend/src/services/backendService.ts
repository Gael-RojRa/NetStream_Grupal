import backendApi from './backendApi';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface MediaStatus {
  id: number;
  type: 'movie' | 'series';
  watched: boolean;
  favorite: boolean;
  watchlist: boolean;
}

export interface MediaItem {
  media_id: number;
  media_type: 'movie' | 'series';
}

export interface MediaRequest {
  id: number;
  type: 'movie' | 'series';
}

// Autenticación
export async function backendLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await backendApi.post('/login', credentials);
  return response.data;
}

export async function backendRegister(credentials: RegisterCredentials): Promise<{ message: string }> {
  const response = await backendApi.post('/register', credentials);
  return response.data;
}

// Obtener estado de medios
export async function getMediaStatus(mediaItems: MediaItem[]): Promise<MediaStatus[]> {
  const response = await backendApi.post('/media/status', { mediaItems });
  return response.data;
}

// Watchlist
export async function addToWatchlist(mediaId: number, mediaType: 'movie' | 'series'): Promise<{ id: number; type: 'movie' | 'series'; watchlist: boolean }> {
  const response = await backendApi.post('/media/watchlist', { media_id: mediaId, media_type: mediaType });
  return response.data;
}

export async function removeFromWatchlist(mediaId: number, mediaType: 'movie' | 'series'): Promise<{ id: number; type: 'movie' | 'series'; watchlist: boolean }> {
  const response = await backendApi.delete('/media/watchlist', { data: { media_id: mediaId, media_type: mediaType } });
  return response.data;
}

export async function getWatchlist(): Promise<MediaItem[]> {
  const response = await backendApi.get('/media/watchlist');
  return response.data;
}

// Watched
export async function markAsWatched(mediaId: number, mediaType: 'movie' | 'series'): Promise<{ id: number; type: 'movie' | 'series'; watched: boolean }> {
  const response = await backendApi.post('/media/watched', { media_id: mediaId, media_type: mediaType });
  return response.data;
}

export async function removeFromWatched(mediaId: number, mediaType: 'movie' | 'series'): Promise<{ id: number; type: 'movie' | 'series'; watched: boolean }> {
  const response = await backendApi.delete('/media/watched', { data: { media_id: mediaId, media_type: mediaType } });
  return response.data;
}

export async function getWatched(): Promise<MediaItem[]> {
  const response = await backendApi.get('/media/watched');
  return response.data;
}

// Favorites
export async function addToFavorites(mediaId: number, mediaType: 'movie' | 'series'): Promise<{ id: number; type: 'movie' | 'series'; favorite: boolean }> {
  const response = await backendApi.post('/media/favorite', { media_id: mediaId, media_type: mediaType });
  return response.data;
}

export async function removeFromFavorites(mediaId: number, mediaType: 'movie' | 'series'): Promise<{ id: number; type: 'movie' | 'series'; favorite: boolean }> {
  const response = await backendApi.delete('/media/favorite', { data: { media_id: mediaId, media_type: mediaType } });
  return response.data;
}

export async function getFavorites(): Promise<MediaItem[]> {
  const response = await backendApi.get('/media/favorites');
  return response.data;
}

// Health check
export async function checkBackendHealth(): Promise<{ db: boolean; error?: string }> {
  const response = await backendApi.get('/health');
  return response.data;
}
