<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { SerieExtended } from '@/types/serieExtended';
import type { MovieExtended } from '@/types/movieExtended';
import { ref, computed } from 'vue';
import { fetchSerieBySlug } from '@/services/series';
import { fetchMovieBySlug } from '@/services/movies';
import { onMounted } from 'vue';

const route = useRoute();
const serie = ref<SerieExtended | null>(null);
const movie = ref<MovieExtended | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Detectar si es una serie o película basado en la ruta
const isMovie = computed(() => {
  return route.query.type === 'movie' || route.path.includes('/movie/');
});

const mediaData = computed(() => {
  return isMovie.value ? movie.value?.data : serie.value?.data;
});

onMounted(async () => {
  try {
    const slug = route.params.slug as string;

    if (!slug) {
      throw new Error('Slug is required');
    }

    if (isMovie.value) {
      const movieData = await fetchMovieBySlug(slug);
      console.log('slug movie', slug);
      movie.value = movieData;
    } else {
      const serieData = await fetchSerieBySlug(slug);
      serie.value = serieData;
    }

  } catch (err) {
    error.value = `Error fetching ${isMovie.value ? 'movie' : 'serie'} details`;
    console.error(err);
  } finally {

    loading.value = false;
  }
});

const getYouTubeEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

// Funciones auxiliares para manejar diferencias entre series y películas
const getNetworkInfo = computed(() => {
  if (isMovie.value && movie.value) {
    // Para películas, usar el primer estudio o compañía de producción
    const studio = movie.value.data.studios?.[0];
    const productionCompany = movie.value.data.companies?.production?.[0];
    return studio || productionCompany || null;
  } else if (serie.value) {
    return serie.value.data.originalNetwork;
  }
  return null;
});

const getDurationInfo = computed(() => {
  if (isMovie.value && movie.value) {
    return `${movie.value.data.runtime}m`;
  } else if (serie.value) {
    return `${serie.value.data.averageRuntime}m`;
  }
  return '';
});

const getSeasonInfo = computed(() => {
  if (!isMovie.value && serie.value) {
    return `${serie.value.data.seasons.length} seasons`;
  }
  return '';
});

const getBudgetInfo = computed(() => {
  if (isMovie.value && movie.value) {
    return movie.value.data.budget || movie.value.data.boxOffice;
  }
  return '';
});
</script>

<template>
  <div v-if="loading" class="loading">Cargando ...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else-if="mediaData" class="media-details">

    <div class="media-details__poster">
      <img class="poster__img" :src="mediaData.image" alt="Media Poster" />
    </div>

    <div class="media-details__content">
      <div class="media-details__network" v-if="getNetworkInfo">
        <span class="network__name">{{ getNetworkInfo.name }}</span>
      </div>
      <h1 class="media-title">{{ mediaData.name }}</h1>
      <div class="general-info">
        <span class="general-info__text">{{ mediaData.score }}</span>
        <span class="general-info__text">{{ mediaData.year }}</span>
        <span class="general-info__text" v-if="getSeasonInfo">{{ getSeasonInfo }}</span>
        <span class="general-info__text">{{ mediaData.status.name }}</span>
        <span class="general-info__text">{{ getDurationInfo }}</span>
        <span class="general-info__text" v-if="getBudgetInfo">{{ getBudgetInfo }}</span>
      </div>
      <div class="media-genre">
        <span class="media-genre__text" v-for="genre in mediaData.genres" :key="genre.id">{{ genre.name }}</span>
      </div>
      <div class="media-description" v-if="mediaData.lists[0]?.overview">
        <p class="media-description__text">{{ mediaData.lists[0]?.overview }}</p>
      </div>
      <hr>
      <div class="media-Control">
        <button class="media-Control__button">
          <img class="control-icon" src="../images/watchlist.svg" alt="">
          <span class="control-button__text">Add to Watchlist</span>
        </button>
        <button class="media-Control__button">
          <img class="control-icon" src="../images/watched.svg" alt="">
          <span class="control-button__text">Mark as Watched</span>
        </button>
        <button class="media-Control__button">
          <img class="control-icon" src="../images/favorite.svg" alt="">
          <span class="control-button__text">Mark as Favorite</span>
        </button>
      </div>
      <button class="play-button">
        <img class="play-button__img" src="../images/watch.svg" alt="">
        <span class="play-button__text">Watch Now</span>
      </button>
      <hr>
      <div class="media-cast" v-if="mediaData.characters?.length">
        <h2>Cast</h2>
        <div class="media-cast__actors">
          <div class="media-cast__actor" v-for="actor in mediaData.characters" :key="actor.id">
            <img class="actor__img" :src="actor.personImgURL" alt="">
            <span class="actor__name">{{ actor.personName }}</span>
          </div>
        </div>
      </div>
      <hr v-if="mediaData.characters?.length">
      <div class="media-trailers" v-if="mediaData.trailers?.length">
        <h2>Trailers</h2>
        <div class="media-trailers__content">
          <div class="media-trailers__trailer" v-for="trailer in mediaData.trailers" :key="trailer.id">
            <iframe width="250" height="140" :src="getYouTubeEmbedUrl(trailer.url)" title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
            </iframe>
          </div>
        </div>
      </div>
      <hr v-if="mediaData.trailers?.length">
      <div class="media-images" v-if="mediaData.artworks?.length">
        <h2>Images</h2>
        <div class="media-images__content">
          <div class="media-images__image-container"
            v-for="artwork in mediaData.artworks?.filter(artwork => artwork.type === 3)" :key="artwork.id">
            <img class="media-images__image" :src="artwork.image" alt="">
          </div>
        </div>
      </div>

      <!-- Información específica de películas -->
      <div v-if="isMovie && movie" class="movie-specific">
        <hr v-if="movie.data.releases?.length">
        <div class="movie-releases" v-if="movie.data.releases?.length">
          <h2>Release Information</h2>
          <div class="releases-info">
            <div v-for="release in movie.data.releases" :key="release.country" class="release-item">
              <span class="release-country">{{ release.country }}</span>
              <span class="release-date">{{ new Date(release.date).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.media-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.media-details__poster {
  width: 100%;
}

.poster__img {
  width: 100%;
  height: 360px;
  object-fit: cover;
  object-position: top;
  display: block;
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}

.media-details__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.media-details__network {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
}

.network__name {
  height: 100%;
  font-size: 1.2rem;
}

.media-title {
  font-weight: 300;
}

.general-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.general-info__text {
  font-size: 0.7rem;
  color: #b0b0b0;
  font-weight: 600;
}

.general-info__text:not(:first-of-type)::before {
  content: "•";
  margin-right: 5px;
  color: #b0b0b0;
}

.media-genre {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
}

.media-genre__text {
  padding: 5px 10px;
  background-color: #23242a;
  border-radius: 6px;
  font-size: 0.7rem;
}

.media-description__text {
  font-size: 0.8rem;
  color: #b0b0b0;
  text-align: center;
  max-width: 600px;
}

hr {
  color: rgb(45, 45, 45);
  width: 100%;
}

.media-Control {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  width: 100%;
}

.media-Control__button {
  background-color: transparent;
  border: 1px solid #7b7b7b6d;
  border-radius: 100%;
  padding: 5px;
  height: 40px;
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.control-button__text {
  text-wrap: nowrap;
  width: fit-content;
  font-size: 0.8rem;
  color: #b0b0b0;
}

.control-icon {
  width: 100%;
}

.play-button {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: center;
  background-color: #bac3ff;
  padding: 10px 20px;
  border-radius: 50px;
  width: 100%;
  margin-top: 30px;
}

.play-button__text {
  font-size: .9rem;
  font-weight: 600;
  color: #2a2e47;
}

.play-button__img {
  width: 22px;
  height: 22px;
}

.media-cast {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  align-items: flex-start;
}

.media-cast__actors {
  display: flex;
  flex-direction: row;
  gap: 15px;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.media-cast__actor {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  width: 90px;
  flex-shrink: 0;
}

.actor__img {
  width: 100%;
}

.actor__name {
  text-wrap: wrap;
  width: 60%;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.2rem;
}

.media-trailers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.media-trailers__content {
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  width: 100%;
}

.media-images {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 10px;
}

.media-images__content {
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  width: 100%;
}

.media-images__image {
  width: 250px;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
}

/* Estilos específicos para películas */
.movie-specific {
  width: 100%;
}

.movie-releases {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.releases-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.release-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.release-country {
  font-weight: 600;
}

.release-date {
  color: #b0b0b0;
}
</style>