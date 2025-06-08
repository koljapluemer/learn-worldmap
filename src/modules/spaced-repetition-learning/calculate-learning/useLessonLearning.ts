import { ref } from 'vue'
import { FSRS, type Card, createEmptyCard, Rating } from 'ts-fsrs'
import type { LessonCard } from '@/modules/shared-types/types'
import { useLessonDexie } from './useLessonDexie'
import { useLearningProgress } from './useLearningProgress'
import type { Lesson } from '@/lessons/Lesson'

const fsrs = new FSRS({})

export function useLessonLearning() {
  const { getCard, saveCard, getAllCards } = useLessonDexie()
  const { setAvailableLessons, updateProgress } = useLearningProgress()

  const availableLessons = ref<Lesson[]>([])

  const setLessons = (lessons: Lesson[]) => {
    availableLessons.value = lessons
    setAvailableLessons(lessons)
  }

  const handleExerciseCompletion = async (lessonName: string, attempts: number) => {
    console.log('Handling exercise completion for lesson:', lessonName, 'with attempts:', attempts)
    
    // Get or create lesson card
    let card = await getCard(lessonName)
    if (!card) {
      const newCard = createEmptyCard()
      card = {
        ...newCard,
        id: lessonName,
        name: lessonName
      }
    }

    // Determine rating based on attempts
    let rating: Rating
    switch (attempts) {
      case 1:
        rating = Rating.Good
        break
      case 2:
        rating = Rating.Hard
        break
      default:
        rating = Rating.Again
    }

    // Update card with FSRS
    const result = fsrs.next(card, new Date(), rating)
    const updatedCard = {
      ...result.card,
      id: lessonName,
      name: lessonName
    }

    // Save updated card
    await saveCard(updatedCard)

    // Update progress
    await updateProgress()

    return updatedCard
  }

  return {
    setLessons,
    handleExerciseCompletion
  }
} 