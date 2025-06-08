import { useDexie } from '@/modules/spaced-repetition-learning/calculate-learning/useDexie'
import { ref, computed } from 'vue'
import type { Exercise } from '@/lessons/types'

export interface LearningProgress {
  notDue: number
  due: number
  neverLearned: number
  total: number
}

export function useLearningProgress() {
  const { getAllCards, getDueCards } = useDexie()
  const availableExercises = ref<Exercise[]>([])
  const progress = ref<LearningProgress>({
    notDue: 0,
    due: 0,
    neverLearned: 0,
    total: 0
  })

  const setAvailableExercises = (exercises: Exercise[]) => {
    availableExercises.value = exercises
    progress.value.total = exercises.length
  }

  const updateProgress = async () => {
    const allCards = await getAllCards()
    const dueCards = await getDueCards()
    
    // Create a set of all exercises that have cards
    const learnedExercises = new Set(allCards.map(card => card.exerciseId))
    
    // Count due cards
    const dueCount = dueCards.length
    
    // Count not due cards (learned but not due)
    const notDueCount = allCards.length - dueCount
    
    // Count never learned exercises
    const neverLearnedCount = availableExercises.value.length - learnedExercises.size
    
    progress.value = {
      notDue: notDueCount,
      due: dueCount,
      neverLearned: neverLearnedCount,
      total: availableExercises.value.length
    }
  }

  const progressPercentages = computed(() => ({
    notDue: (progress.value.notDue / progress.value.total) * 100,
    due: (progress.value.due / progress.value.total) * 100,
    neverLearned: (progress.value.neverLearned / progress.value.total) * 100
  }))

  // Create a custom event for progress updates
  const progressUpdateEvent = new Event('learning-progress-update')

  return {
    progress,
    progressPercentages,
    setAvailableExercises,
    updateProgress,
    progressUpdateEvent
  }
} 