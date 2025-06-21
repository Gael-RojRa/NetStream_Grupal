<script setup lang="ts">

import NavShows from '@/components/NavShows.vue';


</script>


<template>

    <NavShows />
    <main class="main-content">
    <router-view />
    </main>


</template>

<style scoped>

.main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

</style>