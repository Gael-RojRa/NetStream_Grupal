<script setup lang="ts">
import router from '@/router';

const props = defineProps<{
  id: number
  title: string
  image?: string
  rating: number
  slug?: string
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
  router.push({
    name: 'details',
    params: {
      slug: props.slug,
    }
  });
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
  transition: all 0.2s ease-out;
}

.category__item:hover {
  cursor: pointer;
  border: 2px solid #ffffff;
  border-radius: 13px;
  transform: scale(0.96);
  padding: 4px;
  transition: all 0.2s ease-out;
  transition: transform 0.2s ease-out;
}

.category__image-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.category__item-image {
  width: 100%;
  height: 100%;
  max-height: 285.117px;
  border-radius: 10px;
}

.category__item-rating {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 3px 6px;
  border-radius: 8px;
  color: white;
  background-color: rgba(0, 0, 0, 0.632);
  z-index: 1;
  font-size: 0.8rem;
}

.category__item-title {
    display: -webkit-box;
  -webkit-line-clamp: 2; /* Limita a 2 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.4em; /* Altura fija para 2 líneas */
  line-height: 1.2em;
  margin-top: 5px;
  font-size: 0.9rem;
}
</style>