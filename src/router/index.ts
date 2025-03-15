import { createRouter, createWebHistory } from 'vue-router';
import ManageFlashcardsView from '../views/ManageFlashcardsView.vue';
import PracticeFlashcardsView from '../views/PracticeFlashcardsView.vue';
import WorldMapGame from '../views/WorldMapGame.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/manage'
    },
    {
      path: '/manage',
      name: 'manage',
      component: ManageFlashcardsView
    },
    {
      path: '/practice',
      name: 'practice',
      component: PracticeFlashcardsView
    },
    {
      path: '/worldmap',
      name: 'worldmap',
      component: WorldMapGame
    }
  ]
});

export default router; 