// Interfaces para episodios de temporada
export interface SeasonEpisodes {
  status: string;
  data: {
    series: {
      id: number;
      name: string;
      slug: string;
      image: string;
    };
    episodes: SeasonEpisode[];
  };
}

export interface SeasonEpisode {
  id: number;
  seriesId: number;
  name: string;
  aired: Date | string | null;
  runtime: number | null;
  nameTranslations: string[] | null;
  overview: string | null;
  overviewTranslations: string[] | null;
  image: string | null;
  imageType: number | null;
  isMovie: number;
  seasons: any;
  number: number;
  absoluteNumber: number;
  seasonNumber: number;
  lastUpdated: string | Date;
  finaleType: string | null;
  year?: string;
  airsAfterSeason?: number;
}
