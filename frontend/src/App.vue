<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import Header from "@/components/Header.vue";
import NavBar from "@/components/NavBar.vue";
</script>

<template>
  <div class="app__container">
    <Header />
    <RouterView />
  </div>
  <NavBar />
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
