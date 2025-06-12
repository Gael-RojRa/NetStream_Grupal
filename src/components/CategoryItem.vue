<template>
  <div class="category__item">
    <div class="category__image-container">
      <img
        class="category__item-image"
        src="https://images.cdn.prd.api.discomax.com/2025/05/24/d3580862-41c2-3ba4-9b1c-8b361e31b8e0.jpeg"
        alt="Westworld"
      />
      <div class="category__item-rating">7.9</div>
    </div>
    <h3 class="category__item-title">Venom</h3>
  </div>
</template>

<style scroped>

.category__item {
  display: flex;
  flex-direction: column;
  min-width: 160px;
  max-width: 160px;
  min-height: 270px;
  max-height: 270px;
  flex: 0 0 160px 240px;
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
  margin-top: 5px;
  font-size: 0.9rem;
}

</style>