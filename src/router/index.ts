import { createRouter, createWebHistory } from 'vue-router';
import StatsView from '../views/StatsView.vue';
import PlayView from '../views/PlayView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/manage'
    },
    {
      path: '/play',
      name: 'play',
      component: PlayView
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView
    }
  ]
});

export default router; 