import { createRouter, createWebHashHistory } from 'vue-router';
import Play from './modules/play/Play.vue';
import SettingsView from './modules/settings-view/SettingsView.vue';
import CreateLearningGoals from './modules/admin/create-learning-goals/CreateLearningGoals.vue';
import LearningContentOverviewAdmin from './modules/learning-content/views/LearningContentOverviewAdmin.vue';
import AdminViewLearnEvents from './modules/learning-content/tracking/learning-event/AdminViewLearnEvents.vue';
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
      path: '/admin/goals',
      name: 'adminGoals',
      component: CreateLearningGoals
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
    }
  ]
});

export default router; 