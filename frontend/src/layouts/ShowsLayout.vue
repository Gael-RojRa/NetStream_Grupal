<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavShows from '@/components/NavShows.vue';
import NavUserLists from '@/components/NavUserLists.vue';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const authStore = useAuthStore();

// Determinar si estamos en rutas de usuario
const isUserSection = computed(() => route.path.startsWith('/user'));
const isShowsSection = computed(() => route.path.startsWith('/shows'));

</script>

<template>
    <main class="main-content">
        <!-- Mostrar navegación de shows si está en sección de shows -->
        <NavShows v-if="isShowsSection" />
        
        <!-- Mostrar navegación de listas de usuario si está autenticado y en cualquier sección relacionada -->
        <NavUserLists v-if="authStore.isAuthenticated && (isUserSection || isShowsSection)" />
        
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