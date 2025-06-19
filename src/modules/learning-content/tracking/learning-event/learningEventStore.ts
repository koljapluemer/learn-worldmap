import { defineStore } from 'pinia'
import type { LearningEvent } from './LearningEvent'

interface State {
  events: LearningEvent[]
}

export const useLearningEventStore = defineStore('learningEvent', {
  state: (): State => ({
    events: []
  }),
  actions: {
    addEvent(event: LearningEvent) {
      // Validate event shape
      if (
        event &&
        typeof event.timestamp !== 'undefined' &&
        typeof event.exerciseId === 'string' &&
        typeof event.msFromExerciseToFirstClick === 'number' &&
        typeof event.msFromExerciseToFinishClick === 'number' &&
        typeof event.numberOfClicksNeeded === 'number' &&
        typeof event.distanceOfFirstClickToCenterOfCountry === 'number'
      ) {
        this.events.push(event)
      } else {
        console.warn('Invalid LearningEvent:', event)
      }
    }
  },
  persist: true
})
