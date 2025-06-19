import { createRouter, createWebHashHistory } from 'vue-router';
import Play from './modules/play/Play.vue';
import SettingsView from './modules/settings-view/SettingsView.vue';
import LearningContentOverviewAdmin from './modules/learning-content/views/LearningContentOverviewAdmin.vue';
import AdminViewLearnEvents from './modules/learning-content/tracking/learning-event/AdminViewLearnEvents.vue';
import AdminViewExerciseProgress from './modules/learning-content/tracking/exercise/AdminViewExerciseProgress.vue';
import AdminViewLearningGoalProgress from './modules/learning-content/tracking/learning-goal-progress/AdminViewLearningGoalProgress.vue';
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
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/admin/data',
      name: 'adminData',
      component: LearningContentOverviewAdmin
    },
    {
      path: '/admin/events',
      name: 'adminEvents',
      component: AdminViewLearnEvents
    },
    {
      path: '/admin/exercises',
      name: 'adminExerciseProgress',
      component: AdminViewExerciseProgress
    },
    {
      path: '/admin/goalprogress',
      name: 'adminGoalProgress',
      component: AdminViewLearningGoalProgress
    }
  ]
});

export default router; 