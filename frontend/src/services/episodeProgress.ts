import axios from 'axios';
import type { 
  EpisodeWatched, 
  SeasonProgress, 
  EpisodeWatchedRequest, 
  EpisodeWatchedResponse 
} from '@/types/episodeProgress';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Configurar axios con el token
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token'); // Cambiado de 'authToken' a 'jwt_token'
  console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
  if (!token) {
    console.warn('⚠️ No hay token de autenticación');
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const episodeProgressService = {
  // Marcar episodio como visto
  async markEpisodeWatched(episodeData: EpisodeWatchedRequest): Promise<EpisodeWatchedResponse> {
    console.log('📡 POST /episodes/watched:', episodeData);
    console.log('📡 Headers:', getAuthHeaders());
    console.log('📡 URL completa:', `${API_BASE_URL}/episodes/watched`);
    
    const response = await axios.post(
      `${API_BASE_URL}/episodes/watched`,
      episodeData,
      { headers: getAuthHeaders() }
    );
    console.log('📡 Respuesta POST /episodes/watched:', response.data);
    return response.data;
  },

  // Desmarcar episodio como visto
  async unmarkEpisodeWatched(series_id: number, episode_id: number): Promise<EpisodeWatchedResponse> {
    console.log('📡 DELETE /episodes/watched:', { series_id, episode_id });
    const response = await axios.delete(
      `${API_BASE_URL}/episodes/watched`,
      { 
        data: { series_id, episode_id },
        headers: getAuthHeaders() 
      }
    );
    console.log('📡 Respuesta DELETE /episodes/watched:', response.data);
    return response.data;
  },

  // Obtener todos los episodios vistos de una serie
  async getWatchedEpisodes(series_id: number): Promise<EpisodeWatched[]> {
    const response = await axios.get(
      `${API_BASE_URL}/episodes/watched/${series_id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Obtener progreso por temporadas de una serie
  async getSeriesProgress(series_id: number): Promise<SeasonProgress[]> {
    const response = await axios.get(
      `${API_BASE_URL}/series/progress/${series_id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Toggle episodio visto/no visto
  async toggleEpisodeWatched(
    series_id: number, 
    season_number: number, 
    episode_id: number, 
    episode_number: number, 
    isCurrentlyWatched: boolean
  ): Promise<EpisodeWatchedResponse> {
    console.log('🔄 Toggle episode service called:', { 
      series_id, season_number, episode_id, episode_number, isCurrentlyWatched 
    });
    
    if (isCurrentlyWatched) {
      console.log('➖ Desmarcando episodio...');
      return this.unmarkEpisodeWatched(series_id, episode_id);
    } else {
      console.log('➕ Marcando episodio...');
      return this.markEpisodeWatched({
        series_id,
        season_number,
        episode_id,
        episode_number
      });
    }
  }
};
