<script setup lang="ts">
import CategorySection from "@/components/CategorySection.vue";
</script>

<template>
  <main class="main">
    <!-- Sección de contenido trending (mixto: películas y series populares) -->
    <CategorySection 
      title="🔥 Tendencias del Momento" 
      media-type="movies" 
      :page="1"
      sort-by="trending"
      :limit="15"
    />
    
    <!-- Sección de películas populares -->
    <CategorySection 
      title="🎬 Películas Populares" 
      media-type="movies" 
      :page="1"
      sort-by="popular"
      :limit="12"
    />
    
    <!-- Sección de series aclamadas -->
    <CategorySection 
      title="⭐ Series Aclamadas" 
      media-type="series" 
      :page="1" 
      sort-by="acclaimed"
      :limit="12"
    />
    
    <!-- Sección de descubrimientos aleatorios -->
    <CategorySection 
      title="🎲 Descubre Algo Nuevo" 
      media-type="series" 
      :page="3" 
      sort-by="random"
      :limit="8"
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