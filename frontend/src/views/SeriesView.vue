<script setup lang="ts">

import SeriesCard from '@/components/CategoryItem.vue';

</script>

<template>

<div class="content-grid">

  <SeriesCard/>
  <SeriesCard/>
  <SeriesCard/>
  <SeriesCard/>

</div>
  
</template>

<style scoped>

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(162px, 1fr));
  align-items: center;
  justify-items: center;
  width: 100%;
  gap: 5px;
}

</style>