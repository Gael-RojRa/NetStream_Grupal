<script setup lang="ts">
import CategorySection from "@/components/CategorySection.vue";
import { fetchMovies } from "@/services/movies";

const page = 4;
fetchMovies(page)
  .then((movies) => {
    console.log("Fetched movies:", movies);
  })
  .catch((error) => {
    console.error("Error fetching movies:", error);
  });


</script>

<template>


  <main class="main">
    <CategorySection />
    <CategorySection />
    <CategorySection />
    <CategorySection />
  </main>


</template>

<style scoped>
.main {
  margin-top: 1.6rem;
}
</style>
