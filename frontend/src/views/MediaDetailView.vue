<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { SerieExtended } from '@/types/serieExtended';
import type { MovieExtended } from '@/types/movieExtended';
import { ref, computed } from 'vue';
import { fetchSerieBySlug } from '@/services/series';
import { fetchMovieBySlug } from '@/services/movies';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserListsStore } from '@/stores/userListsStore';
import MediaActions from '@/components/MediaActions.vue';

const route = useRoute();
const authStore = useAuthStore();
const userListsStore = useUserListsStore();
const serie = ref<SerieExtended | null>(null);
const movie = ref<MovieExtended | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Detectar si es una serie o película basado en la ruta
const isMovie = computed(() => {
  return route.name === 'movie-details' || route.path.includes('/movie/');
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
      movie.value = movieData;
    } else {
      const serieData = await fetchSerieBySlug(slug);
      serie.value = serieData;
    }

  } catch (err) {
    error.value = `Error al cargar los detalles de ${isMovie.value ? 'la película' : 'la serie'}`;
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

const getNetworkInfo = computed(() => {
  if (isMovie.value && movie.value) {
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
    return `${movie.value.data.runtime || 0}m`;
  } else if (serie.value) {
    return `${serie.value.data.averageRuntime || 0}m`;
  }
  return '';
});

const getSeasonInfo = computed(() => {
  if (!isMovie.value && serie.value) {
    return `${serie.value.data.seasons.length} temporadas`;
  }
  return '';
});

const getReleaseYear = computed(() => {
  if (isMovie.value && movie.value) {
    return movie.value.data.year;
  } else if (serie.value) {
    return serie.value.data.year;
  }
  return '';
});

const getGenres = computed(() => {
  return mediaData.value?.genres || [];
});

const getOverview = computed(() => {
  return mediaData.value?.lists?.[0]?.overview || '';
});

const getTrailers = computed(() => {
  return mediaData.value?.trailers || [];
});

const getCharacters = computed(() => {
  return mediaData.value?.characters || [];
});

const getArtworks = computed(() => {
  return mediaData.value?.artworks || [];
});

const getStatus = computed(() => {
  return mediaData.value?.status.name || {};
});

const getMobileImage = computed(() => {
  if (!mediaData.value?.artworks) return mediaData.value?.image || '';


  const verticalImages = mediaData.value.artworks.filter(artwork =>
    artwork.height > artwork.width
  );


  const priorityVertical = verticalImages.find(artwork =>
    [14, 3, 7, 8].includes(artwork.type)
  );

  const anyVertical = verticalImages[0];

  return priorityVertical?.image || anyVertical?.image || mediaData.value?.image || '';
});

const getDesktopImage = computed(() => {
  if (!mediaData.value?.artworks) return mediaData.value?.image || '';


  const horizontalImages = mediaData.value.artworks.filter(artwork =>
    artwork.width > artwork.height
  );


  const priorityHorizontal = horizontalImages.find(artwork =>
    [1, 2, 3, 15, 16].includes(artwork.type)
  );

  const anyHorizontal = horizontalImages[0];

  return priorityHorizontal?.image || anyHorizontal?.image || mediaData.value?.image || '';
});

const fallbackAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="%236c757d"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/></svg>';

const getActorImg = (character: { personImgURL?: string }) => {
  return character.personImgURL && character.personImgURL.trim() !== ''
    ? character.personImgURL
    : fallbackAvatar;
};

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement | null;
  if (target && target.src !== fallbackAvatar) {
    target.src = fallbackAvatar;
  }
};



</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="loading-container">
    <div class="loading-poster-skeleton"></div>
    <div class="loading-content">
      <div class="loading-network-skeleton"></div>
      <div class="loading-title-skeleton"></div>
      <div class="loading-info-skeleton"></div>
      <div class="loading-genres-skeleton">
        <div class="loading-genre-skeleton" v-for="n in 3" :key="n"></div>
      </div>
      <div class="loading-description-skeleton">
        <div class="loading-line-skeleton" v-for="n in 4" :key="n"></div>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="error-container">
    <div class="error-icon">⚠️</div>
    <h2 class="error-title">Error al cargar</h2>
    <p class="error-message">{{ error }}</p>
    <button class="error-retry" @click="$router.go(-1)">Volver atrás</button>
  </div>

  <!-- Content -->
  <div v-else-if="mediaData" class="media-details">
    <div class="media-details__poster">
      <!-- Imagen para móvil (vertical) -->
      <img class="poster__img poster__img--mobile" :src="getMobileImage" :alt="mediaData.name" loading="lazy" />
      <!-- Imagen para desktop (horizontal) -->
      <img class="poster__img poster__img--desktop" :src="getDesktopImage" :alt="mediaData.name" loading="lazy" />
    </div>

    <div class="media-details__content">
      <div class="media-details__network" v-if="getNetworkInfo">
        <span class="network__name">{{ getNetworkInfo.name }}</span>
      </div>

      <h1 class="media-title">{{ mediaData.name }}</h1>

      <div class="general-info">
        <span class="general-info__text" v-if="getReleaseYear">{{ getReleaseYear }}</span>
        <span class="general-info__text" v-if="getSeasonInfo">{{ getSeasonInfo }}</span>
        <span class="general-info__text" v-if="getDurationInfo">{{ getDurationInfo }}</span>
        <span class="general-info__text" v-if="getStatus">{{ getStatus }}</span>
        <span class="general-info__text">{{ mediaData.score }}</span>
      </div>

      <div class="media-genre" v-if="getGenres.length">
        <span class="media-genre__text" v-for="genre in getGenres" :key="genre.id">
          {{ genre.name }}
        </span>
      </div>

      <div class="media-description" v-if="getOverview">
        <p class="media-description__text">{{ getOverview }}</p>
      </div>

      <hr>

      <!-- Acciones de usuario (watchlist, watched, favorites) -->
      <div class="media-Control">
        <MediaActions v-if="mediaData" :mediaId="mediaData.id" :mediaType="isMovie ? 'movie' : 'series'" />
      </div>



      <hr>

      <div class="media-cast" v-if="getCharacters.length">
        <h3>Reparto</h3>
        <div class="media-cast__actors">
          <div class="media-cast__actor" v-for="character in getCharacters.slice(0, 10)" :key="character.id">
            <img class="actor__img" :src="getActorImg(character)" :alt="character.personName" @error="onImageError" />



            <span class="actor__name">{{ character.personName }}</span>
          </div>
        </div>
      </div>

      <hr v-if="getCharacters.length">

      <div class="media-trailers" v-if="getTrailers.length">
        <h3>Tráilers</h3>
        <div class="media-trailers__content">
          <iframe v-for="trailer in getTrailers.slice(0, 3)" :key="trailer.id" :src="getYouTubeEmbedUrl(trailer.url)"
            :title="trailer.name" frameborder="0" allowfullscreen class="trailer-iframe"></iframe>
        </div>
      </div>

      <hr v-if="getTrailers.length">

      <div class="media-images" v-if="getArtworks.length">
        <h3>Imágenes</h3>
        <div class="media-images__content">
          <img v-for="artwork in getArtworks.slice(0, 6)" :key="artwork.id" class="media-images__image"
            :src="artwork.image" :alt="`Imagen de ${mediaData.name}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  animation: pulse 2s ease-in-out infinite;
}

.loading-poster-skeleton {
  width: 100%;
  height: 360px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 20px;
}

.loading-network-skeleton {
  width: 120px;
  height: 20px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.loading-title-skeleton {
  width: 250px;
  height: 32px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.loading-info-skeleton {
  width: 200px;
  height: 16px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.loading-genres-skeleton {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.loading-genre-skeleton {
  width: 80px;
  height: 24px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 12px;
}

.loading-description-skeleton {
  width: 100%;
  max-width: 600px;
}

.loading-line-skeleton {
  width: 100%;
  height: 14px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.loading-line-skeleton:last-child {
  width: 70%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

/* Error States */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 40px;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #ff6b6b;
}

.error-message {
  color: #b0b0b0;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.error-retry {
  background-color: #bac3ff;
  color: #2a2e47;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-retry:hover {
  background-color: #a8b3ff;
}

/* Content Styles */
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
  object-position: center;
  display: block;
  background-color: transparent;
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}

/* Móvil: mostrar imagen vertical */
.poster__img--mobile {
  display: block;
}

.poster__img--desktop {
  display: none;
}

.media-details__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 0;
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
  font-weight: 600;
  color: #bac3ff;
}

.media-title {
  font-weight: 300;
  font-size: 2rem;
  text-align: center;
  margin: 0;
}

.general-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
}

.general-info__text {
  font-size: 0.8rem;
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
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.media-genre__text {
  padding: 6px 12px;
  background-color: #23242a;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
}

.media-description {
  max-width: 600px;
  text-align: center;
}

.media-description__text {
  font-size: 0.9rem;
  color: #b0b0b0;
  line-height: 1.5;
}

hr {
  border: none;
  height: 1px;
  background-color: rgb(45, 45, 45);
  width: 100%;
  margin: 20px 0;
}

.media-Control {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  width: 100%;
}

.media-Control__button {
  height: 50px;
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;
  border: none;
  text-align: center;
}

.control-button__text {
  font-size: 0.7rem;
  color: #b0b0b0;
  margin-top: 4px;
  text-align: center;
  width: 100%;
  text-wrap: nowrap;
}

.control-icon {
  padding: 8px;
  border: 1px solid #7b7b7b6d;
  border-radius: 100%;
  width: 100%;
  height: 100%;
}

.play-button {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: center;
  background-color: #bac3ff;
  padding: 12px 24px;
  border-radius: 50px;
  width: 100%;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.play-button:hover {
  background-color: #a8b3ff;
}

.play-button__text {
  font-size: 1rem;
  font-weight: 600;
  color: #2a2e47;
}

.play-button__img {
  width: 24px;
  height: 24px;
}

.media-cast {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  align-items: flex-start;
}

.media-cast h3 {
  font-size: 1.2rem;
  margin: 0;
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
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.actor__img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #3a3b47;
}

.actor__name {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
  color: #bfbdc2;
}

.media-trailers {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.media-trailers h3 {
  font-size: 1.2rem;
  margin: 0;
}

.media-trailers__content {
  display: flex;
  flex-direction: row;
  gap: 15px;
  overflow-x: auto;
  width: 100%;
  padding: 10px 0;
}

.trailer-iframe {
  width: 300px;
  height: 169px;
  border-radius: 10px;
  flex-shrink: 0;
}

.media-images {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 15px;
}

.media-images h3 {
  font-size: 1.2rem;
  margin: 0;
}

.media-images__content {
  display: flex;
  flex-direction: row;
  gap: 15px;
  overflow-x: auto;
  width: 100%;
  padding: 10px 0;
}

.media-images__image {
  width: 250px;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
  border: 2px solid #3a3b47;
}

.media-actions-container {
  margin: 20px 0;
}

/* Responsive Desktop */
@media (min-width: 768px) {
  .play-button {
    width: 25%;
  }

  /* Desktop: mostrar imagen horizontal */
  .poster__img--mobile {
    display: none;
  }

  .poster__img--desktop {
    display: block;
  }
}
</style>
