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
      ],
    },

    {
      path: "/details/:slug",
      name: "details",
      component: () => import("@/components/MediaDetailed.vue"),
    },
  ],
});

export default router;
