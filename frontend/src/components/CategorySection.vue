<script setup lang="ts">
import CategoryItem from "./CategoryItem.vue";
import { ref, onMounted } from 'vue';

interface Props {
  title: string;
  mediaType: 'movies' | 'series';
  page?: number;
  sortBy?: 'popular' | 'recent' | 'top_rated' | 'random' | 'trending' | 'acclaimed';
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
  sortBy: 'popular',
  limit: 10
});

const items = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const getRandomPages = (count: number = 2) => {
  // Generar páginas aleatorias entre 1 y 10 para obtener variedad
  const pages = [];
  for (let i = 0; i < count; i++) {
    pages.push(Math.floor(Math.random() * 10) + 1);
  }
  return pages;
};

const sortItems = (items: any[], sortType: string) => {
  switch (sortType) {
    case 'top_rated':
      return items.sort((a, b) => (b.score || 0) - (a.score || 0));
    case 'recent':
      return items.sort((a, b) => {
        const dateA = new Date(a.year || a.firstAired || '1900');
        const dateB = new Date(b.year || b.firstAired || '1900');
        return dateB.getTime() - dateA.getTime();
      });
    case 'random':
      return items.sort(() => Math.random() - 0.5);
    case 'popular':
    default:
      // Ya vienen ordenados por popularidad
      return items;
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    let allItems: any[] = [];
    
    // Usar servicios especializados para trending y popular
    if (props.sortBy === 'trending') {
      const { getTrendingContent } = await import('@/services/trendingMedia');
      const trendingItems = await getTrendingContent(props.limit);
      items.value = trendingItems;
      return;
    }
    
    if (props.sortBy === 'popular' && props.mediaType === 'movies') {
      const { getPopularMovies } = await import('@/services/trendingMedia');
      const popularMovies = await getPopularMovies(props.limit);
      items.value = popularMovies;
      return;
    }
    
    if (props.sortBy === 'acclaimed' && props.mediaType === 'series') {
      const { getAcclaimedSeries } = await import('@/services/trendingMedia');
      const acclaimedSeries = await getAcclaimedSeries(props.limit);
      items.value = acclaimedSeries;
      return;
    }
    
    if (props.sortBy === 'recent') {
      const { getRecentContent } = await import('@/services/trendingMedia');
      const recentItems = await getRecentContent(props.mediaType, props.limit);
      items.value = recentItems;
      return;
    }
    
    // Si es random o top_rated, obtener de múltiples páginas para mejor variedad
    const pagesToFetch = (props.sortBy === 'random' || props.sortBy === 'top_rated') 
      ? getRandomPages(3) 
      : [props.page];
    
    // Importar dinámicamente los servicios según el tipo
    if (props.mediaType === 'movies') {
      const { fetchMovies } = await import('@/services/movies');
      
      for (const page of pagesToFetch) {
        const response = await fetchMovies(page);
        allItems = allItems.concat(response.data);
      }
    } else {
      const { fetchSeries } = await import('@/services/series');
      
      for (const page of pagesToFetch) {
        const response = await fetchSeries(page);
        allItems = allItems.concat(response.data);
      }
    }
    
    // Remover duplicados basado en ID
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    // Aplicar ordenamiento
    const sortedItems = sortItems(uniqueItems, props.sortBy);
    
    // Limitar la cantidad de items
    items.value = sortedItems.slice(0, props.limit);
    
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
        :media-type="item.type || mediaType" 
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
  scrollbar-width: thin;
  scrollbar-color: #bac3ff #2c2d38;
}

.category__grid::-webkit-scrollbar {
  height: 8px;
}

.category__grid::-webkit-scrollbar-track {
  background: #2c2d38;
  border-radius: 4px;
}

.category__grid::-webkit-scrollbar-thumb {
  background: #bac3ff;
  border-radius: 4px;
}

.category__grid::-webkit-scrollbar-thumb:hover {
  background: #a8b3ff;
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