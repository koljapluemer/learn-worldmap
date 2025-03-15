import { ref } from 'vue'
import { FSRS } from 'ts-fsrs'

interface Card {
  question: string
  answer: string
  tags: string[]
}

const fsrs = new FSRS()

export function useSpacedRepetition() {
  const createOrUpdateCard = async (card: Card) => {
    // Here we would typically:
    // 1. Check if the card exists in the database
    // 2. If it exists, update its spaced repetition data
    // 3. If it doesn't exist, create a new card with initial spaced repetition data
    
    // For now, we'll just log the card
    console.log('Creating/updating card:', card)
  }

  return {
    createOrUpdateCard
  }
} 