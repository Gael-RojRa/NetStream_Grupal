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

  const response = await api.get(`series/${id}`);
  return response.data;
}
