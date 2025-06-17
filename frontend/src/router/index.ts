import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/shows',
      redirect: '/shows/series',
      name: 'shows',
      component: () => import('@/layouts/ShowsLayout.vue'),
    children: [
    {
      path: '/shows/series',
      name: 'series',
      component: () => import('@/views/SeriesView.vue'),
    },
    {
      path: '/shows/movies',
      name: 'movies',
      component: () => import('@/views/MoviesView.vue'),
    }
    
    ]
    }
  ],
})

export default router
