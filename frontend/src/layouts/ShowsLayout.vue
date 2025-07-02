<script setup lang="ts">

import NavShows from '@/components/NavShows.vue';


</script>


<template>


    <main class="main-content">
        <NavShows />
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
    margin-top: 40px;
}

@media (min-width: 768px) {
    .main-content {
        margin-top: 60px;
    }
}
</style>