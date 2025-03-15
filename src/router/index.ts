import { createRouter, createWebHistory } from 'vue-router';
import WorldMapGame from '../views/WorldMapGame.vue';
import StatsView from '../views/StatsView.vue';
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/manage'
    },
    {
      path: '/worldmap',
      name: 'worldmap',
      component: WorldMapGame
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView
    }
  ]
});

export default router; 