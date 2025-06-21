<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { SerieExtended } from '@/types/serieExtended';
import { ref } from 'vue';
import { fetchSerieBySlug } from '@/services/series';
import { onMounted } from 'vue';

const route = useRoute();
const serie = ref<SerieExtended | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const slug = route.params.slug as string;

    if (!slug) {
      throw new Error('Slug is required');
    }

    const serieData = await fetchSerieBySlug(slug);
    serie.value = serieData;

  } catch (err) {
    error.value = 'Error fetching serie details';
    console.error(err);
  } finally {
    console.log(serie.value);
    loading.value = false;
  }
});

const getYouTubeEmbedUrl = (url: string) => {
  // Convertir URL normal de YouTube a embed
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  // Si ya es una URL de embed, devolverla tal como está
  return url;
};
</script>


<template>
  <div v-if="loading" class=loading>Cargando ...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else-if="serie" class="media-details">

    <div class="media-details__poster">
      <img class="poster__img" :src="serie.data.image" alt="Media Poster" />
    </div>

    <div class="media-details__content">
      <div class="media-details__network">
        <img class="network__icon" :src="serie.data.originalNetwork.name" alt="">
        <span class="network__name"> {{ serie.data.originalNetwork.name }}</span>
      </div>
      <h1 class="media-title"> {{ serie.data.name }}</h1>
      <div class="general-info">
        <img class="score-icon" src="" alt="IMDB">
        <span class="general-info__text">{{ serie.data.score }}</span>
<span class="general-info__text">{{ serie.data.year }}</span>
        <span class="general-info__text">{{ serie.data.seasons.length }} seasons</span>
        <span class="general-info__text">{{ serie.data.status.name }}</span>
        <span class="general-info__text">{{ serie.data.averageRuntime }}m</span>
      </div>
      <div class="media-genre">
        <span class="media-genre__text" v-for="genre in serie.data.genres" :key="genre.id">{{ genre.name }}</span>

      </div>
      <div class="media-description">
        <p class="media-description__text"> {{ serie.data.overview }}</p>
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
      <div class="media-cast">
        <h2>Cast</h2>
        <div class="media-cast__actors">
          <div class="media-cast__actor" v-for="actor in serie.data.characters" :key="actor.id">
            <img class="actor__img" :src="actor.personImgURL" alt="">
            <span class="actor__name">{{ actor.personName }}</span>
          </div>
        </div>
      </div>
      <hr>
      <div class="media-trailers">
        <h2>Trailers</h2>
        <div class="media-trailers__content">
          <div class="media-trailers__trailer" v-for="trailer in serie.data.trailers" :key="trailer.id">
            <iframe width="250" height="140" :src="getYouTubeEmbedUrl(trailer.url)" title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
            </iframe>
          </div>
        </div>
      </div>
      <hr>
      <div class="media-images">
        <h2>Images</h2>
        <div class="media-images__content">
          <div class="media-images__image-container"
            v-for="artwork in serie.data.artworks?.filter(artwork => artwork.type === 3)" :key="artwork.id">
            <img class="media-images__image" :src="artwork.image" alt="">
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

.network__icon {
  width: 20px;
  height: 20px;
}

.network__name {
  height: 100%;
  font-size: 1.2rem;
}

.media-title {
  font-weight: 300;
}

.score-icon {}

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

.media-description {}

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

.media-trailers__trailer {}


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

.media-images__image-container {}

.media-images__image {
  width: 250px;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
}
</style>