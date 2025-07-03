export interface EpisodeWatched {
  series_id: number;
  season_number: number;
  episode_id: number;
  episode_number: number;
  watched_at: string;
}

export interface SeasonProgress {
  season_number: number;
  watched_episodes: number;
  total_episodes?: number;
  progress_percentage?: number;
}

export interface SeriesProgress {
  series_id: number;
  total_watched: number;
  total_episodes: number;
  progress_percentage: number;
  seasons: SeasonProgress[];
}

export interface EpisodeWatchedRequest {
  series_id: number;
  season_number: number;
  episode_id: number;
  episode_number: number;
}

export interface EpisodeWatchedResponse {
  series_id: number;
  season_number: number;
  episode_id: number;
  episode_number: number;
  watched: boolean;
}
