<script setup lang="ts">
import CategorySection from "@/components/CategorySection.vue";
</script>

<template>
  <main class="main">
    <!-- Sección de películas populares -->
    <CategorySection 
      title="Películas Populares" 
      media-type="movies" 
      :page="1" 
    />
    
    <!-- Sección de series populares -->
    <CategorySection 
      title="Series Populares" 
      media-type="series" 
      :page="1" 
    />
    
    <!-- Sección de películas nuevas -->
    <CategorySection 
      title="Últimas Películas" 
      media-type="movies" 
      :page="2" 
    />
    
    <!-- Sección de series nuevas -->
    <CategorySection 
      title="Series Recomendadas" 
      media-type="series" 
      :page="2" 
    />
  </main>
</template>

<style scoped>
.main {
  margin-top: 60px;
  padding: 0 16px;
  padding-bottom: 30px; /* Espacio para el navbar inferior */
}

@media (min-width: 768px) {
  .main {
    margin-top: 90px;
  }
}

</style>