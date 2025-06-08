import { useLessonDexie } from './useLessonDexie'
import { ref, computed } from 'vue'

interface LearningProgress {
  totalLessons: number
  dueLessons: number
  notDueLessons: number
  neverLearnedLessons: number
  duePercentage: number
  notDuePercentage: number
  neverLearnedPercentage: number
}

export function useLearningProgress() {
  const { getAllCards, getDueCards } = useLessonDexie()
  const availableLessonIds = ref<string[]>([])
  const progress = ref<LearningProgress>({
    totalLessons: 0,
    dueLessons: 0,
    notDueLessons: 0,
    neverLearnedLessons: 0,
    duePercentage: 0,
    notDuePercentage: 0,
    neverLearnedPercentage: 0
  })

  const setAvailableLessons = (lessonIds: string[]) => {
    availableLessonIds.value = lessonIds
    progress.value.totalLessons = lessonIds.length
    updateProgress()
  }

  const updateProgress = async () => {
    const allCards = await getAllCards()
    const dueCards = await getDueCards()
    
    // Create sets for quick lookup
    const learnedLessonIds = new Set(allCards.map(card => card.id))
    const dueLessonIds = new Set(dueCards.map(card => card.id))
    
    // Count lessons in each category
    const dueLessons = availableLessonIds.value.filter(id => dueLessonIds.has(id)).length
    const neverLearnedLessons = availableLessonIds.value.filter(id => !learnedLessonIds.has(id)).length
    const notDueLessons = availableLessonIds.value.length - dueLessons - neverLearnedLessons
    
    // Update progress
    progress.value = {
      totalLessons: availableLessonIds.value.length,
      dueLessons,
      notDueLessons,
      neverLearnedLessons,
      duePercentage: (dueLessons / availableLessonIds.value.length) * 100,
      notDuePercentage: (notDueLessons / availableLessonIds.value.length) * 100,
      neverLearnedPercentage: (neverLearnedLessons / availableLessonIds.value.length) * 100
    }

    // Dispatch progress update event
    const event = new CustomEvent('learning-progress-update', {
      detail: progress.value
    })
    window.dispatchEvent(event)
  }

  const progressPercentages = computed(() => ({
    due: progress.value.duePercentage,
    notDue: progress.value.notDuePercentage,
    neverLearned: progress.value.neverLearnedPercentage
  }))

  return {
    progress,
    progressPercentages,
    setAvailableLessons,
    updateProgress
  }
} 