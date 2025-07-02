<script setup lang="ts">
import CategoryItem from "./CategoryItem.vue";
import { ref, onMounted } from 'vue';

interface Props {
  title: string;
  mediaType: 'movies' | 'series';
  page?: number;
}

const props = withDefaults(defineProps<Props>(), {
  page: 1
});

const items = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    
    // Importar dinámicamente los servicios según el tipo
    if (props.mediaType === 'movies') {
      const { fetchMovies } = await import('@/services/movies');
      const response = await fetchMovies(props.page);
      items.value = response.data.slice(0, 10); // Limitar a 10 items por sección
      console.log(items.value);
    } else {
      const { fetchSeries } = await import('@/services/series');
      const response = await fetchSeries(props.page);
      items.value = response.data.slice(0, 10); // Limitar a 10 items por sección
      console.log(items.value);
    }
  } catch (err) {
    error.value = `Error al cargar ${props.mediaType}`;
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="category">
    <div class="category__header">
      <h2 class="category__title">{{ title }}</h2>
      <div class="category__arrow-container">
        <img
          class="category__arrow"
          src="../temporalImgs/right-arrow.svg"
          alt="Ver más"
        />
      </div>
    </div>
    <div class="category__grid">
      <!-- Loading skeleton -->
      <div v-if="loading" class="loading-grid">
        <div v-for="n in 6" :key="n" class="loading-item">
          <div class="loading-image"></div>
          <div class="loading-title"></div>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- Content -->
      <CategoryItem 
        v-else
        v-for="item in items" 
        :key="item.id" 
        :id="item.id" 
        :title="item.name" 
        :image="item.image || item.image_url"
        :rating="item.score || 5" 
        :slug="item.slug" 
        :media-type="mediaType" 
      />
    </div>
  </section>
</template>

<style scoped>
.category {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.2rem;
  width: 100%;
}

.category__header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.category__title {
  font-size: 1.2rem;
  color: #bfbdc2;
  font-weight: 600;
}

/* .category__arrow-container {
} */

.category__arrow {
  width: 20px;
  height: 20px;
}

.category__grid {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 10px;
  padding: 15px 0;
  width: 100%;
  flex-wrap: nowrap;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category__grid::-webkit-scrollbar {
  display: none;
}

/* Loading styles */
.loading-grid {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  min-width: max-content;
}

.loading-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

.loading-image {
  width: 145px;
  height: 200px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 10px;
}

.loading-title {
  width: 120px;
  height: 16px;
  background: linear-gradient(90deg, #2c2d38 25%, #3a3b47 50%, #2c2d38 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  padding: 20px;
  text-align: center;
  width: 100%;
  flex-shrink: 0;
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
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>