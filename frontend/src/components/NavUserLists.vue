<template>
  <nav class="nav-user-lists">
    <router-link to="/user/watchlist" class="router-link">
      <div class="router-link__div">
        <img src="../images/watchlist.svg" alt="" class="nav-icon">
        Watchlist
        <span class="count-badge" v-if="userListsStore.watchlist.length > 0">
          {{ userListsStore.watchlist.length }}
        </span>
      </div>
    </router-link>
    
    <router-link to="/user/watched" class="router-link">
      <div class="router-link__div">
        <img src="../images/watched.svg" alt="" class="nav-icon">
        Watched
        <span class="count-badge" v-if="userListsStore.watched.length > 0">
          {{ userListsStore.watched.length }}
        </span>
      </div>
    </router-link>
    
    <router-link to="/user/favorites" class="router-link">
      <div class="router-link__div">
        <img src="../images/favorite.svg" alt="" class="nav-icon">
        Favorites
        <span class="count-badge" v-if="userListsStore.favorites.length > 0">
          {{ userListsStore.favorites.length }}
        </span>
      </div>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserListsStore } from '@/stores/userListsStore';
import { useAuthStore } from '@/stores/authStore';

const userListsStore = useUserListsStore();
const authStore = useAuthStore();

// Cargar listas cuando el componente se monta
onMounted(async () => {
  if (authStore.isAuthenticated && userListsStore.watchlist.length === 0) {
    await userListsStore.loadAllLists();
  }
});
</script>

<style scoped>
.nav-user-lists {
  margin-top: 15px;
  margin-bottom: 15px;
  width: 100%;
  display: flex;
  flex-direction: row;
  height: 50px;
  align-items: center;
  background: rgba(40, 41, 49, 0.3);
  border-radius: 10px;
}

.router-link {
  text-decoration: none;
  font-size: 16px;
  flex: 1;
  text-align: center;
  height: 100%;
}

.router-link__div {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  position: relative;
  padding: 0 10px;
}

.nav-icon {
  width: 18px;
  height: 18px;
  filter: brightness(0.7);
  transition: filter 0.3s ease;
}

.router-link-active .router-link__div {
  color: #fff;
  border-bottom: 3px solid #365bfe;
  background-color: #2829315c;
  border-radius: 10px 10px 0 0;
}

.router-link-active .nav-icon {
  filter: brightness(1);
}

.router-link:hover:not(.router-link-active) .router-link__div {
  color: #ccc;
  background-color: rgba(40, 41, 49, 0.5);
  border-radius: 10px;
}

.router-link:hover:not(.router-link-active) .nav-icon {
  filter: brightness(0.9);
}

.count-badge {
  background: #365bfe;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.router-link-active .count-badge {
  background: #fff;
  color: #365bfe;
}

@media (max-width: 768px) {
  .router-link {
    font-size: 14px;
  }
  
  .router-link__div {
    gap: 6px;
    padding: 0 5px;
  }
  
  .nav-icon {
    width: 16px;
    height: 16px;
  }
  
  .count-badge {
    font-size: 11px;
    padding: 1px 4px;
  }
}
</style>
