import { defineStore } from 'pinia';
import type { LearningGoalProgress } from './LearningGoalProgress';

export const useLearningGoalProgressStore = defineStore('learningGoalProgress', {
  state: () => ({
    progressList: [] as LearningGoalProgress[],
  }),
  actions: {
    setProgress(progress: LearningGoalProgress) {
      const idx = this.progressList.findIndex(p => p.learningGoalName === progress.learningGoalName);
      if (idx !== -1) {
        this.progressList[idx] = progress;
      } else {
        this.progressList.push(progress);
      }
    },
    getProgress(learningGoalName: string): LearningGoalProgress | undefined {
      return this.progressList.find(p => p.learningGoalName === learningGoalName);
    },
  },
  persist: true,
});
