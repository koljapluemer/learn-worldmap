import { createRouter, createWebHashHistory } from 'vue-router';
import PlayStandardView from './modules/play/play-modes/standard-play/PlayStandardView.vue';
import StatsView from './modules/misc-views/stats-view/main-stats/StatsView.vue';
import CountryStatsView from './modules/misc-views/stats-view/per-country-stats/CountryStatsView.vue';
import PlayChallengeView from './modules/play/play-modes/challenge-play/PlayChallengeView.vue';

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
    }
  ]
});

export default router; 