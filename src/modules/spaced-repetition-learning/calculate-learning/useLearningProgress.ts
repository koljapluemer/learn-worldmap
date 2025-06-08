import { useLessonDexie } from '@/modules/spaced-repetition-learning/calculate-learning/useLessonDexie'
import { ref, computed } from 'vue'
import type { Lesson } from '@/lessons/Lesson'

export interface LearningProgress {
  notDue: number
  due: number
  neverLearned: number
  total: number
}

export function useLearningProgress() {
  const { getAllCards, getDueCards } = useLessonDexie()
  const availableLessons = ref<Lesson[]>([])
  const progress = ref<LearningProgress>({
    notDue: 0,
    due: 0,
    neverLearned: 0,
    total: 0
  })

  const setAvailableLessons = (lessons: Lesson[]) => {
    availableLessons.value = lessons
    progress.value.total = lessons.length
  }

  const updateProgress = async () => {
    const allCards = await getAllCards()
    const dueCards = await getDueCards()
    
    // Create a set of all lessons that have cards
    const learnedLessons = new Set(allCards.map(card => card.name))
    
    // Count due cards
    const dueCount = dueCards.length
    
    // Count not due cards (learned but not due)
    const notDueCount = allCards.length - dueCount
    
    // Count never learned lessons
    const neverLearnedCount = availableLessons.value.length - learnedLessons.size
    
    progress.value = {
      notDue: notDueCount,
      due: dueCount,
      neverLearned: neverLearnedCount,
      total: availableLessons.value.length
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
    setAvailableLessons,
    updateProgress,
    progressUpdateEvent
  }
} 