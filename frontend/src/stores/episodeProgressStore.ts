import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { episodeProgressService } from '@/services/episodeProgress';
import type { EpisodeWatched, SeasonProgress, SeriesProgress } from '@/types/episodeProgress';

export const useEpisodeProgressStore = defineStore('episodeProgress', () => {
  // Estado
  const watchedEpisodes = ref<Map<number, EpisodeWatched[]>>(new Map());
  const seriesProgress = ref<Map<number, SeasonProgress[]>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters computados
  const isEpisodeWatched = computed(() => {
    return (series_id: number, episode_id: number): boolean => {
      const episodes = watchedEpisodes.value.get(series_id) || [];
      return episodes.some(ep => ep.episode_id === episode_id);
    };
  });

  const getSeasonProgress = computed(() => {
    return (series_id: number, season_number: number): SeasonProgress | null => {
      const seasons = seriesProgress.value.get(series_id) || [];
      return seasons.find(s => s.season_number === season_number) || null;
    };
  });

  const getSeriesOverallProgress = computed(() => {
    return (series_id: number, totalEpisodes: number): SeriesProgress => {
      const seasons = seriesProgress.value.get(series_id) || [];
      const totalWatched = seasons.reduce((sum, season) => sum + season.watched_episodes, 0);
      
      return {
        series_id,
        total_watched: totalWatched,
        total_episodes: totalEpisodes,
        progress_percentage: totalEpisodes > 0 ? (totalWatched / totalEpisodes) * 100 : 0,
        seasons
      };
    };
  });

  // Acciones
  const loadWatchedEpisodes = async (series_id: number) => {
    try {
      loading.value = true;
      error.value = null;
      
      const episodes = await episodeProgressService.getWatchedEpisodes(series_id);
      watchedEpisodes.value.set(series_id, episodes);
    } catch (err) {
      error.value = 'Error al cargar episodios vistos';
      console.error('Error loading watched episodes:', err);
    } finally {
      loading.value = false;
    }
  };

  const loadSeriesProgress = async (series_id: number) => {
    try {
      loading.value = true;
      error.value = null;
      
      const progress = await episodeProgressService.getSeriesProgress(series_id);
      seriesProgress.value.set(series_id, progress);
    } catch (err) {
      error.value = 'Error al cargar progreso de la serie';
      console.error('Error loading series progress:', err);
    } finally {
      loading.value = false;
    }
  };

  const toggleEpisodeWatched = async (
    series_id: number,
    season_number: number,
    episode_id: number,
    episode_number: number
  ) => {
    console.log('🏪 Store toggle called:', { series_id, season_number, episode_id, episode_number });
    
    try {
      loading.value = true;
      error.value = null;
      
      const isWatched = isEpisodeWatched.value(series_id, episode_id);
      console.log('📊 Estado actual del episodio:', { isWatched });
      
      const result = await episodeProgressService.toggleEpisodeWatched(
        series_id,
        season_number,
        episode_id,
        episode_number,
        isWatched
      );
      
      console.log('📡 Respuesta del servicio:', result);

      // Recargar datos después del toggle
      console.log('🔄 Recargando datos...');
      await Promise.all([
        loadWatchedEpisodes(series_id),
        loadSeriesProgress(series_id)
      ]);
      
      console.log('✅ Datos recargados exitosamente');
      
    } catch (err) {
      error.value = 'Error al actualizar estado del episodio';
      console.error('❌ Error toggling episode watched:', err);
    } finally {
      loading.value = false;
    }
  };

  const calculateSeasonProgress = (
    series_id: number, 
    season_number: number, 
    totalEpisodesInSeason: number
  ): SeasonProgress => {
    const progress = getSeasonProgress.value(series_id, season_number);
    const watchedCount = progress?.watched_episodes || 0;
    
    return {
      season_number,
      watched_episodes: watchedCount,
      total_episodes: totalEpisodesInSeason,
      progress_percentage: totalEpisodesInSeason > 0 ? (watchedCount / totalEpisodesInSeason) * 100 : 0
    };
  };

  const clearSeriesData = (series_id: number) => {
    watchedEpisodes.value.delete(series_id);
    seriesProgress.value.delete(series_id);
  };

  const clearAllData = () => {
    watchedEpisodes.value.clear();
    seriesProgress.value.clear();
    error.value = null;
  };

  return {
    // Estado
    watchedEpisodes,
    seriesProgress,
    loading,
    error,
    
    // Getters
    isEpisodeWatched,
    getSeasonProgress,
    getSeriesOverallProgress,
    
    // Acciones
    loadWatchedEpisodes,
    loadSeriesProgress,
    toggleEpisodeWatched,
    calculateSeasonProgress,
    clearSeriesData,
    clearAllData
  };
});
