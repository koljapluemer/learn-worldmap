import { defineStore } from 'pinia'
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'
import type { ExerciseProgress } from './ExerciseProgress'
import type { LearningEvent } from '../learning-event/LearningEvent'

interface State {
  progress: Record<string, ExerciseProgress>
}

const scheduler = fsrs() // default parameters

export const useExerciseProgressStore = defineStore('exerciseProgress', {
  state: (): State => ({
    progress: {}
  }),
  actions: {
    updateProgressFromEvent(event: LearningEvent) {
      const id = event.exerciseId
      const correct = event.numberOfClicksNeeded === 1
      const rating = correct ? Rating.Good : Rating.Again
      const timestamp = new Date(event.timestamp)
      let entry = this.progress[id]
      if (!entry) {
        entry = {
          ...createEmptyCard(),
          exerciseId: id,
          streak: 0
        }
      }
      // Use fsrs.next to get the new card state
      const { card } = scheduler.next(entry, timestamp, rating)
      
      // If the exercise was incorrect, reset it to be due immediately
      // otherwise, it unlocks the next exercise level for the country
      // even though the exercise was wrong
      // also, we don't want to wait 10 minutes to practice a country again
      const updatedCard = correct ? card : {
        ...card,
        due: timestamp // Reset to current time so it's due immediately
      }
      
      this.progress[id] = {
        ...updatedCard,
        exerciseId: id,
        streak: correct ? (entry.streak + 1) : 0
      }
    }
  },
  persist: true
})
