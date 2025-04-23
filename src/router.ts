import { createRouter, createWebHashHistory } from 'vue-router';
import PlayStandardView from './modules/play/play-modes/standard-play/PlayStandardView.vue';
import StatsView from './modules/misc-views/stats-view/main-stats/StatsView.vue';
import CountryStatsView from './modules/misc-views/stats-view/per-country-stats/CountryStatsView.vue';
import PlayChallengeView from './modules/play/play-modes/challenge-play/PlayChallengeView.vue';
import SettingsView from './modules/misc-views/settings-view/SettingsView.vue';
import CustomPlay from './modules/play/play-modes/custom-play/CustomPlay.vue';

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
      component: PlayStandardView
    },
    {
      path: '/play-custom',
      name: 'playCustom',
      component: CustomPlay
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
      path: '/challenge',
      name: 'challenge',
      component: PlayChallengeView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
});

export default router; 