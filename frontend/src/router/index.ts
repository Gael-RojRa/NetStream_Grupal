import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/home",
      name: "root",
      component: MainLayout,
      children: [
        {
          path: "/home",
          name: "home",
          component: () => import("@/views/HomeView.vue"),
        },
        {
          path: "/shows",
          redirect: "/shows/series",
          name: "shows",
          component: () => import("@/layouts/ShowsLayout.vue"),
          children: [
            {
              path: "/shows/series",
              name: "series",
              component: () => import("@/views/SeriesView.vue"),
            },
            {
              path: "/shows/movies",
              name: "movies",
              component: () => import("@/views/MoviesView.vue"),
            },
          ],
        },
        {
          path: "/user",
          redirect: "/user/watchlist",
          name: "user",
          component: () => import("@/layouts/ShowsLayout.vue"),
          children: [
            {
              path: "/user/watchlist",
              name: "user-watchlist",
              component: () => import("@/views/WatchlistView.vue"),
            },
            {
              path: "/user/watched",
              name: "user-watched",
              component: () => import("@/views/WatchedView.vue"),
            },
            {
              path: "/user/favorites",
              name: "user-favorites",
              component: () => import("@/views/FavoritesView.vue"),
            },
          ],
        },
      ],
    },
    {
      path: "/details/movie/:slug",
      name: "movie-details",
      component: () => import("@/views/MediaDetailView.vue"),
    },
    {
      path: "/details/serie/:slug",
      name: "serie-details",
      component: () => import("@/views/MediaDetailView.vue"),
    },
  ],
});

export default router;