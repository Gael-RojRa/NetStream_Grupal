<script setup lang="ts">

</script>

<template>

<nav class="nav-shows">

  <router-link to="/shows/series" class="router-link">
    <div class="router-link__div">
      Series
    </div>
  </router-link>
  <router-link to="/shows/movies" class="router-link">
    <div class="router-link__div">
      Movies
    </div>
  </router-link>

</nav>

</template>

<style scoped>

.nav-shows {
  margin-top: 15px;
  margin-bottom: 15px;
  width: 100%;
  display: flex;
  flex-direction: row;
  height: 50px;
  align-items: center;
}

.router-link {
  text-decoration: none;
  font-size: 18px;
  flex: 1;
  text-align: center;
  height: 100%;
  
}

.router-link__div {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.router-link-active .router-link__div {
  color: #fff;
  border-bottom: 3px solid #365bfe;
  background-color: #2829315c;
  border-radius: 10px 10px 0 0;
}

</style>