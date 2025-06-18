<script setup lang="ts">
import CategoryItem from "./CategoryItem.vue";
</script>

<template>
  <section class="category">
    <div class="category__header">
      <h2 class="category__title">Para ti</h2>
      <div class="category__arrow-container">
        <img
          class="category__arrow"
          src="../temporalImgs/right-arrow.svg"
          alt="Ver más"
        />
      </div>
    </div>
    <div class="category__scroll">
      <div class="category__grid">

      </div>
    </div>
  </section>
</template>

<style scoped>
.category {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.2rem;
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
}

/* .category__arrow-container {
} */

.category__arrow {
  width: 20px;
  height: 20px;
}

.category__scroll {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.category__grid {
  display: flex;
  flex-direction: row;
  overflow-x: scroll;
  gap: 10px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  padding: 15px 0;
}
</style>
