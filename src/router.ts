import { createRouter, createWebHashHistory } from 'vue-router';
import Play from './modules/play/Play.vue';
import StatsView from './modules/stats-view/main-stats/StatsView.vue';
import CountryStatsView from './modules/stats-view/per-country-stats/CountryStatsView.vue';
import SettingsView from './modules/settings-view/SettingsView.vue';

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
      component: Play
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView
    },
    {
      path: '/stats/:country',
      name: 'countryStats',
      component: CountryStatsView,
      props: true
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
});

export default router; 