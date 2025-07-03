import api from "./api";
import type { Serie } from "../types/serie";
import type { SerieExtended } from "../types/serieExtended";
import { login } from "./auth";
import { useMediaStore } from "@/stores/mediaStore";
import { processMediaArray } from '@/utils/imageUrl';

export async function fetchSeries(page: number): Promise<Serie> {
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  if (!page || page < 1) {
    page = 1;
  }

  const response = await api.get<Serie>(`series?page=${page}`);

  if (response.data.data && Array.isArray(response.data.data)) {
    response.data.data = processMediaArray(response.data.data);
  }
  return response.data;
}

export async function fetchSerieIdBySlug(slug: string): Promise<number> {
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  const response = await api.get<SerieExtended>(`series/slug/${slug}`);
  return response.data.data.id;
}

export async function fetchSerieBySlug(slug: string): Promise<SerieExtended> {
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  const id = await fetchSerieIdBySlug(slug);

  const response = await api.get<SerieExtended>(`series/${id}/extended`);
  return response.data;
}

export async function fetchSerieById(id: number): Promise<any> {
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  const response = await api.get<any>(`series/${id}/extended`);
  return response.data;
}

export async function fetchSeasonEpisodes(seriesId: number, seasonType: number, seasonNumber: number): Promise<any> {
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  // Primero intentamos el endpoint estándar para obtener todos los episodios de la serie
  const url = `series/${seriesId}/episodes/default`;
  console.log(`Fetching episodes from API: ${url}`);
  
  try {
    const response = await api.get<any>(url);
    console.log(`API Response for episodes:`, response);
    
    // Filtrar episodios por temporada
    if (response.data && response.data.data && response.data.data.episodes) {
      const episodesForSeason = response.data.data.episodes.filter((episode: any) => 
        episode.seasonNumber === seasonNumber
      );
      
      return {
        status: response.data.status,
        data: {
          series: response.data.data.series,
          episodes: episodesForSeason
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching episodes from API:`, error);
    throw error;
  }
}
