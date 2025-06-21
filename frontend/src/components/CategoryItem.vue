<script setup lang="ts">
import router from '@/router';

const props = defineProps<{
  id: number
  title: string
  image?: string
  rating: number
  slug?: string
  mediaType?: 'series' | 'movies' // Nuevo prop para distinguir el tipo
}>()

const getNewImage = () => {
  if (props.image == null || props.image === 'null') {
    return 'https://artworks.thetvdb.com/banners/images/missing/movie.jpg';
  } else {
    const newImage = `https://artworks.thetvdb.com${props.image}`;
    return newImage;
  }
}

const detailSerie = () => {
  if (props.mediaType === 'movies') {
    router.push({
      name: 'movie-details',
      params: {
        slug: props.slug,
      }
    });
  } else if (props.mediaType === 'series') {
    router.push({
      name: 'serie-details',
      params: {
        slug: props.slug,
      }
    });
  } else {
    router.push({
      name: 'serie-details',
      params: {
        slug: props.slug,
      }
    });
  }
}
</script>

<template>
  <div class="category__item" @click="detailSerie()">
    <div class="category__image-container">
      <img class="category__item-image" :src="getNewImage()" :alt="title" />
      <div class="category__item-rating">{{ rating }}</div>
    </div>
    <h3 class="category__item-title">{{ title }}</h3>
  </div>
</template>

<style scoped>
.category__item {
  display: flex;
  flex-direction: column;
  flex: 1 1 145px;
  max-width: 200px;
  transition: all 0.3s ease-out;
  cursor: pointer;
}

.category__item:hover {
  border: 2px solid #bac3ff;
  border-radius: 15px;
  transform: scale(1.02);
  padding: 6px;
  box-shadow: 0 8px 25px rgba(186, 195, 255, 0.2);
}

.category__image-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

.category__item-image {
  width: 100%;
  height: 100%;
  max-height: 285px;
  border-radius: 10px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category__item:hover .category__item-image {
  transform: scale(1.05);
}

.category__item-rating {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.category__item-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 3.5em;
  line-height: 1.4em;
  margin-top: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #bfbdc2;
  transition: color 0.3s ease;
}

.category__item:hover .category__item-title {
  color: #ffffff;
}
</style>