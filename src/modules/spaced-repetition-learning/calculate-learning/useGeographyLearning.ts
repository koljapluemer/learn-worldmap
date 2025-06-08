import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'
import { useDexie } from './useDexie'
import { getCurrentSeed, seededRandomElement } from '@/modules/randomness/random'
import type { Exercise } from '@/lessons/types'
import type { ExerciseCard } from '@/modules/shared-types/types'

export interface GeographyLearning {
  targetExercise: ComputedRef<Exercise | null>
  message: ComputedRef<string>
  setAvailableExercises: (exercises: Exercise[]) => void
  selectRandomExercise: () => Promise<void>
  handleExerciseCompletion: (exerciseId: string, attempts: number) => Promise<void>
}

export function useGeographyLearning(): GeographyLearning {
  const { getCard, saveCard, getDueCards, getAllCards, deleteCard } = useDexie()
  const targetExercise = ref<Exercise | null>(null)
  const message = ref<string>('')
  const availableExercises = ref<Exercise[]>([])
  const lastPlayedExerciseId = ref<string | null>(null)

  const setAvailableExercises = async (exercises: Exercise[]) => {
    availableExercises.value = exercises
    await cleanupInvalidExercises()
  }

  // Function to clean up invalid exercises from the database
  const cleanupInvalidExercises = async () => {
    const allCards = await getAllCards()
    const validExerciseIds = new Set(availableExercises.value.map(ex => ex.id))
    
    for (const card of allCards) {
      if (!validExerciseIds.has(card.exerciseId)) {
        console.log(`Removing invalid exercise from database: ${card.exerciseId}`)
        await deleteCard(card.exerciseId)
      }
    }
  }

  const selectRandomExercise = async () => {
    // First check for due cards
    const dueCards = await getDueCards()
    
    // Filter out invalid exercises and the last played exercise from due cards
    const validDueCards = dueCards.filter(card => 
      availableExercises.value.some(ex => ex.id === card.exerciseId) && 
      card.exerciseId !== lastPlayedExerciseId.value
    )
    
    if (validDueCards.length > 0) {
      // Select from available due cards using seeded random
      const seed = getCurrentSeed()
      const randomDueCard = seededRandomElement(seed, validDueCards)
      const exercise = availableExercises.value.find(ex => ex.id === randomDueCard.exerciseId)
      if (exercise) {
        targetExercise.value = exercise
        lastPlayedExerciseId.value = exercise.id
        message.value = exercise.instruction
        return
      }
    }

    // If no available due cards, get all cards to find unseen exercises
    const allCards = await getAllCards()
    const seenExerciseIds = new Set(allCards.map(card => card.exerciseId))
    const unseenExercises = availableExercises.value.filter(exercise => 
      !seenExerciseIds.has(exercise.id) && exercise.id !== lastPlayedExerciseId.value
    )
    
    if (unseenExercises.length > 0) {
      // Select from unseen exercises using seeded random
      const seed = getCurrentSeed()
      const selectedExercise = seededRandomElement(seed, unseenExercises)
      
      // Create and save empty card for the new exercise
      const emptyCard = createEmptyCard()
      const newCard: ExerciseCard = {
        ...emptyCard,
        exerciseId: selectedExercise.id
      }
      await saveCard(newCard)
      
      targetExercise.value = selectedExercise
      lastPlayedExerciseId.value = selectedExercise.id
      message.value = selectedExercise.instruction
      return
    }

    // If all exercises have been seen, pick a random one that's not the last played
    const availableForRandom = availableExercises.value.filter(exercise => 
      exercise.id !== lastPlayedExerciseId.value
    )
    
    const seed = getCurrentSeed()
    const selectedExercise = seededRandomElement(seed, availableForRandom)
    targetExercise.value = selectedExercise
    lastPlayedExerciseId.value = selectedExercise.id
    message.value = selectedExercise.instruction
  }

  const handleExerciseCompletion = async (exerciseId: string, attempts: number) => {
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

    let card = await getCard(exerciseId)
    if (!card) {
      console.error('Card not found for exercise:', exerciseId)
      return
    }

    // Apply FSRS
    const f = fsrs()
    const result = f.next(card, new Date(), rating)

    // Save with our modifications
    const finalCard: ExerciseCard = {
      ...result.card,
      exerciseId
    }
    await saveCard(finalCard)

    // Dispatch progress update event
    window.dispatchEvent(new Event('learning-progress-update'))

    // Select next exercise after a delay
    setTimeout(selectRandomExercise, 2000)
  }

  return {
    targetExercise: computed(() => targetExercise.value),
    message: computed(() => message.value),
    setAvailableExercises,
    selectRandomExercise,
    handleExerciseCompletion
  }
} 