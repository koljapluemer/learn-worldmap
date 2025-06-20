import { defineStore } from 'pinia';
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs';
import type { LearningGoalProgress } from './LearningGoalProgress';
import type { LearningEvent } from '../learning-event/LearningEvent';

interface State {
  progress: Record<string, LearningGoalProgress>;
}

const scheduler = fsrs() // default parameters

export const useLearningGoalProgressStore = defineStore('learningGoalProgress', {
  state: (): State => ({
    progress: {}
  }),
  actions: {
    setProgress(progress: LearningGoalProgress) {
      this.progress[progress.learningGoalName] = progress;
    },
    getProgress(learningGoalName: string): LearningGoalProgress | undefined {
      return this.progress[learningGoalName];
    },
    updateProgressFromEvent(event: LearningEvent, learningGoalName: string) {
      const correct = event.numberOfClicksNeeded === 1;
      const rating = correct ? Rating.Good : Rating.Again;
      const timestamp = new Date(event.timestamp);
      
      let entry = this.progress[learningGoalName];
      if (!entry) {
        const emptyCard = createEmptyCard();
        console.log('Empty card created:', emptyCard);
        entry = {
          ...emptyCard,
          learningGoalName,
          isBlacklisted: false,
          priority: 0,
          lastSeenAt: timestamp,
          streak: 0,
          lastRepetitionCorrect: correct,
          correctRepetitionCount: 0
        };
        console.log('Entry created:', entry);
      }
      
      console.log('About to call scheduler.next with entry:', entry);
      // Use fsrs.next to get the new card state
      const { card } = scheduler.next(entry, timestamp, rating);
      

      
      this.progress[learningGoalName] = {
        ...card,
        learningGoalName,
        isBlacklisted: entry.isBlacklisted,
        priority: entry.priority,
        lastSeenAt: timestamp,
        streak: correct ? (entry.streak || 0) + 1 : 0,
        lastRepetitionCorrect: correct,
        correctRepetitionCount: (entry.correctRepetitionCount || 0) + (correct ? 1 : 0)
      };
    }
  },
  persist: true,
});
