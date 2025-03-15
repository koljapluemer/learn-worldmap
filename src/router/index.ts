import { createRouter, createWebHashHistory } from 'vue-router';
import PlayView from '../views/PlayView.vue';
import StatsView from '../views/StatsView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: { name: 'play' }
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
    },
    {
      path: '/stats/:country',
      name: 'countryStats',
      component: () => import('../views/CountryStatsView.vue'),
      props: true
    }
  ]
});

export default router; 