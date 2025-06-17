<script setup lang="ts">


</script>

<template>

  <nav class="nav">
    <div class="nav__menu">
      <div class="nav__item">

        <router-link class="router-link" to="/">
          <img class="nav__icon" src="../temporalImgs/explore.svg" alt="Explore" />
          <span class="nav__text">Explore</span>
        </router-link>


      </div>
      <div class="nav__item">
        <router-link class="router-link" to="/shows">
          <img class="nav__icon" src="../temporalImgs/shows.svg" alt="shows" />
          <span class="nav__text">My shows</span>
        </router-link>

      </div>
      <div class="nav__item">
        <img class="nav__icon" src="../temporalImgs/calendar.svg" alt="Calendar" />
        <span class="nav__text">Calendar</span>
      </div>
      <div class="nav__item">
        <img class="nav__icon" src="../temporalImgs/notification.svg" alt="Notification" />
        <span class="nav__text">Notification</span>
      </div>
    </div>
  </nav>

</template>

<style scoped>
.nav {
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #282931;
  padding: 10px;
  width: 100%;
  z-index: 999;
}

.nav__menu {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
}

.nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 5px;
}

.nav__icon {
  width: 46px;
  height: 32px;
  padding: 5px 10px;
  border-radius: 10px;
}

.router-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
}

.router-link-active .nav__icon {
  background-color: #42455d;
}

.nav__text {
  font-size: 0.8rem;
}
</style>