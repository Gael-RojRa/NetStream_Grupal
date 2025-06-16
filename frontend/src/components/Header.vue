<template>

<header class="header">
      <div class="header__search-container">
        <div class="header__search-icon-container">
          <img
            class="header__search-icon"
            src="../temporalImgs/search.svg"
            alt="Buscar"
          />
        </div>
        <input
          class="header__input"
          type="text"
          placeholder="Search for something."
        />
      </div>
      <img class="header__profile" src="../temporalImgs/pfp.webp" alt="Perfil" />
    </header>

</template>

<style scoped>

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 10px;
  background-color: #2c2d38;
  border-radius: 15px;
}

.header__search-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 50px;
  width: 85%;
  gap: 5px;
}

.header__search-icon-container {
  width: 20px;
  height: 20px;
}

.header__search-icon {
  width: 100%;
  height: 100%;
}

.header__input {
  background-color: transparent;
  border: none;
  width: 100%;
  font-size: 18px;
}

.header__input:focus {
  outline: none;
}

.header__profile {
  width: 35px;
  height: 35px;
  border-radius: 50%;
}

</style>