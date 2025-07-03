<script setup lang="ts">
import { RouterView } from "vue-router";
import { useAppInitialization } from "@/composables/useAppInitialization";

// Inicializar la aplicación
useAppInitialization();
</script>

<template>
  <div class="app__container">
    
    <RouterView />
  </div>
  
</template>

<style>
.app__container {
  order: 2;
  display: flex;
  flex-direction: column;
  background-color: #1b1b1f;
  padding: 15px;
  margin: 8px;
  min-height: 90dvh;
}
</style>
