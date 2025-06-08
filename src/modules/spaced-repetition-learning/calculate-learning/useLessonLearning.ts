import { ref } from 'vue'
import { FSRS, type Card, createEmptyCard, Rating } from 'ts-fsrs'
import type { LessonCard, ExerciseCard } from '@/modules/shared-types/types'
import { useLessonDexie } from './useLessonDexie'
import { useDexie } from './useDexie'
import { useLearningProgress } from './useLearningProgress'
import { LessonManager } from '@/lessons/LessonManager'
import type { Exercise } from '@/lessons/types'
import { getCurrentSeed } from '@/modules/randomness/random'
import { seededRandomElement } from '@/modules/randomness/random'

const fsrs = new FSRS({})

export function useLessonLearning() {
  const { getCard: getLessonCard, saveCard: saveLessonCard, getAllCards: getAllLessonCards, getDueCards: getDueLessonCards } = useLessonDexie()
  const { getCard: getExerciseCard, saveCard: saveExerciseCard, getAllCards: getAllExerciseCards, getDueCards: getDueExerciseCards } = useDexie()
  const { setAvailableLessons, updateProgress } = useLearningProgress()
  const lessonManager = LessonManager.getInstance()

  const lastPickedLessonId = ref<string | null>(null)
  const lastPickedExercise = ref<Exercise | null>(null)

  const setLessons = (lessons: string[]) => {
    setAvailableLessons(lessons)
  }

  const selectNextLesson = async (): Promise<string | null> => {
    const availableLessonIds = lessonManager.getAllLessonIds()
    if (availableLessonIds.length === 0) return null

    // Get all lesson cards
    const allLessonCards = await getAllLessonCards()
    const dueLessonCards = await getDueLessonCards()
    
    // Create sets for quick lookup
    const learnedLessonIds = new Set(allLessonCards.map(card => card.id))
    const dueLessonIds = new Set(dueLessonCards.map(card => card.id))
    
    // Filter out the last picked lesson
    const availableForSelection = availableLessonIds.filter(
      id => id !== lastPickedLessonId.value
    )

    // First try to find a due lesson
    const dueLessonsList = availableForSelection.filter(id => dueLessonIds.has(id))
    if (dueLessonsList.length > 0) {
      const seed = getCurrentSeed()
      const selected = seededRandomElement(seed, dueLessonsList)
      lastPickedLessonId.value = selected
      console.log('Lesson selection:', {
        totalLessons: availableLessonIds.length,
        dueLessons: dueLessonsList.length,
        newLessons: availableLessonIds.length - learnedLessonIds.size,
        selectedLessonId: selected
      })
      return selected
    }

    // If no due lessons, find an unlearned lesson
    const unlearnedLessons = availableForSelection.filter(id => !learnedLessonIds.has(id))
    if (unlearnedLessons.length > 0) {
      const seed = getCurrentSeed()
      const selected = seededRandomElement(seed, unlearnedLessons)
      lastPickedLessonId.value = selected
      console.log('Lesson selection (no due lessons):', {
        totalLessons: availableLessonIds.length,
        dueLessons: 0,
        newLessons: unlearnedLessons.length,
        selectedLessonId: selected
      })
      return selected
    }

    // If all lessons are learned but none are due, pick the one that will be due next
    const nextDueLesson = availableForSelection.reduce((next, current) => {
      const nextCard = allLessonCards.find(card => card.id === next)
      const currentCard = allLessonCards.find(card => card.id === current)
      if (!nextCard || !currentCard) return current
      return nextCard.due < currentCard.due ? next : current
    })

    lastPickedLessonId.value = nextDueLesson
    console.log('Lesson selection (all learned):', {
      totalLessons: availableLessonIds.length,
      dueLessons: 0,
      newLessons: 0,
      selectedLessonId: nextDueLesson
    })
    return nextDueLesson
  }

  const selectNextExercise = async (lessonId: string): Promise<Exercise | null> => {
    const lesson = lessonManager.getLessonById(lessonId)
    if (!lesson || lesson.templates.length === 0) return null

    // Get all exercise cards
    const allExerciseCards = await getAllExerciseCards()
    const dueExerciseCards = await getDueExerciseCards()
    
    // Create sets for quick lookup
    const learnedExercises = new Set(allExerciseCards.map(card => card.exerciseId))
    const dueExercises = new Set(dueExerciseCards.map(card => card.exerciseId))
    
    // Get all exercises from all templates
    const allExercises = lesson.templates.flatMap(template => {
      const seed = getCurrentSeed()
      return template.pickRandomExercise(seed)
    })

    // Filter out the last picked exercise
    const availableForSelection = allExercises.filter(
      exercise => exercise !== lastPickedExercise.value
    )

    // First try to find a due exercise
    const dueExercisesList = availableForSelection.filter(exercise => dueExercises.has(exercise.id))
    if (dueExercisesList.length > 0) {
      const seed = getCurrentSeed()
      const selected = seededRandomElement(seed, dueExercisesList)
      lastPickedExercise.value = selected
      console.log('Exercise selection:', {
        lessonId,
        totalExercises: allExercises.length,
        dueExercises: dueExercisesList.length,
        newExercises: allExercises.length - learnedExercises.size,
        selectedExerciseId: selected.id
      })
      return selected
    }

    // If no due exercises, find an unlearned exercise
    const unlearnedExercises = availableForSelection.filter(exercise => !learnedExercises.has(exercise.id))
    if (unlearnedExercises.length > 0) {
      const seed = getCurrentSeed()
      const selected = seededRandomElement(seed, unlearnedExercises)
      lastPickedExercise.value = selected
      console.log('Exercise selection (no due exercises):', {
        lessonId,
        totalExercises: allExercises.length,
        dueExercises: 0,
        newExercises: unlearnedExercises.length,
        selectedExerciseId: selected.id
      })
      return selected
    }

    // If all exercises are learned but none are due, pick the one that will be due next
    const nextDueExercise = availableForSelection.reduce((next, current) => {
      const nextCard = allExerciseCards.find(card => card.exerciseId === next.id)
      const currentCard = allExerciseCards.find(card => card.exerciseId === current.id)
      if (!nextCard || !currentCard) return current
      return nextCard.due < currentCard.due ? next : current
    })

    lastPickedExercise.value = nextDueExercise
    console.log('Exercise selection (all learned):', {
      lessonId,
      totalExercises: allExercises.length,
      dueExercises: 0,
      newExercises: 0,
      selectedExerciseId: nextDueExercise.id
    })
    return nextDueExercise
  }

  const handleExerciseCompletion = async (lessonId: string, exercise: Exercise, attempts: number) => {
    console.log('Handling exercise completion:', {
      lessonId,
      exerciseId: exercise.id,
      attempts,
      timestamp: new Date().toISOString()
    })
    
    // Get or create lesson card
    let lessonCard = await getLessonCard(lessonId)
    if (!lessonCard) {
      const newCard = createEmptyCard()
      const lesson = lessonManager.getLessonById(lessonId)
      if (!lesson) {
        console.error('Lesson not found:', lessonId)
        return
      }
      lessonCard = {
        ...newCard,
        id: lessonId,
        name: lesson.name
      }
      // Save the initial lesson card
      await saveLessonCard(lessonCard)
    }

    // Get or create exercise card
    let exerciseCard = await getExerciseCard(exercise.id)
    if (!exerciseCard) {
      const newCard = createEmptyCard()
      exerciseCard = {
        ...newCard,
        exerciseId: exercise.id
      }
      // Save the initial exercise card
      await saveExerciseCard(exerciseCard)
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

    // Update lesson card with FSRS
    const lessonResult = fsrs.next(lessonCard, new Date(), rating)
    const updatedLessonCard = {
      ...lessonResult.card,
      id: lessonId,
      name: lessonCard.name // Preserve the original name
    }
    await saveLessonCard(updatedLessonCard)

    // Update exercise card with FSRS
    const exerciseResult = fsrs.next(exerciseCard, new Date(), rating)
    const updatedExerciseCard = {
      ...exerciseResult.card,
      exerciseId: exercise.id
    }
    await saveExerciseCard(updatedExerciseCard)

    // Update progress
    await updateProgress()

    console.log('Exercise completion processed:', {
      lessonId,
      exerciseId: exercise.id,
      rating,
      newLessonDue: updatedLessonCard.due,
      newExerciseDue: updatedExerciseCard.due
    })

    return {
      lessonCard: updatedLessonCard,
      exerciseCard: updatedExerciseCard
    }
  }

  return {
    setLessons,
    handleExerciseCompletion,
    selectNextLesson,
    selectNextExercise
  }
} 