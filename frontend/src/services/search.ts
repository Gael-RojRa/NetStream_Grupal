import api from './api';
import { useMediaStore } from '@/stores/mediaStore';
import { login } from './auth';

export interface SearchResult {
  status: string;
  data:   Datum[];
  links:  Links;
}

export interface Datum {
  objectID:         string;
  aliases?:         string[];
  country:          string;
  id:               string;
  image_url:        string;
  name:             string;
  first_air_time:   Date;
  overview?:        string;
  primary_language: PrimaryLanguage;
  primary_type:     Type;
  status:           Status;
  type:             Type;
  tvdb_id:          string;
  year:             string;
  slug:             string;
  overviews?:       Overviews;
  translations:     Overviews;
  network?:         string;
  remote_ids?:      RemoteID[];
  thumbnail?:       string;
}

export interface Overviews {
  ara?:  string;
  ces?:  string;
  dan?:  string;
  deu?:  string;
  ell?:  string;
  eng?:  string;
  fin?:  string;
  fra?:  string;
  heb?:  string;
  hun?:  string;
  ita?:  string;
  nld?:  string;
  pol?:  string;
  por?:  string;
  pt?:   string;
  rus?:  string;
  spa?:  string;
  swe?:  string;
  tur?:  string;
  ukr?:  string;
  zho?:  string;
  zhtw?: string;
  tha?:  string;
}

export enum PrimaryLanguage {
  Eng = "eng",
  Tha = "tha",
}

export enum Type {
  Series = "series",
  Movie = "movie",
  All = "all",
}

export interface RemoteID {
  id:         string;
  type:       number;
  sourceName: string;
}

export enum Status {
  Continuing = "Continuing",
  Ended = "Ended",
}

export interface Links {
  prev:        null;
  self:        string;
  next:        string;
  total_items: number;
  page_size:   number;
}


export async function searchMedia(query: string, type?: string, limit: number = 20): Promise<SearchResult> {
  if (type === "movies") {
    type = 'movie';
  }
  
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
    type: type || 'all',
  });

  const response = await api.get<SearchResult>(`search?${params.toString()}`);
  return response.data;
}