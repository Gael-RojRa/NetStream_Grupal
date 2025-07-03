<template>
  <CategoryItem
    :id="id"
    :title="title"
    :image="image"
    :rating="currentScore"
    :slug="slug"
    :media-type="mediaType"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CategoryItem from '@/components/CategoryItem.vue';
import { getMediaDetails } from '@/services/userMediaService';

const props = defineProps<{
  id: string
  title: string
  image?: string
  slug?: string
  mediaType?: 'series' | 'movies'
}>()

const currentScore = ref(0);

onMounted(async () => {
  try {
    // Extraer ID numérico del formato "series-123456" o "movie-123456"
    let numericId: number;
    if (props.id.includes('-')) {
      const parts = props.id.split('-');
      numericId = parseInt(parts[parts.length - 1]);
    } else {
      numericId = parseInt(props.id);
    }

    // Obtener detalles reales del media
    const mediaType = props.mediaType === 'movies' ? 'movie' : 'series';
    const details = await getMediaDetails(numericId, mediaType);
    
    if (details?.score) {
      currentScore.value = details.score;
    }
  } catch (error) {
    console.error(`Error getting score for ${props.title}:`, error);
  }
});
</script>
