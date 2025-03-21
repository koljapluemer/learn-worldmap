import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'
import type { CountryCard } from '../../../useDexie'
import type { CardUpdateResult } from '../core/types'

const calculateRequiredWinStreak = (level: number): number => {
  if (level <= 2) return 1
  if (level <= 5) return 2
  return 3
}

const calculateCardUpdate = (
  card: CountryCard,
  isCorrect: boolean,
  isFirstTry: boolean
): CardUpdateResult => {
  const currentLevel = card.level || 0
  const currentWinStreak = card.winStreak || 0
  const currentFailStreak = card.failStreak || 0
  const requiredWinStreak = calculateRequiredWinStreak(currentLevel)

  let newLevel = currentLevel
  let newWinStreak = currentWinStreak
  let newFailStreak = currentFailStreak
  let willLevelUp = false

  if (isCorrect) {
    if (isFirstTry) {
      newWinStreak += 1
      newFailStreak = 0
      
      if (newWinStreak === requiredWinStreak) {
        newLevel += 1
        newWinStreak = 0
        willLevelUp = true
      }
    } else {
      newWinStreak = 0
      newFailStreak += 1
    }
  } else {
    newWinStreak = 0
    newFailStreak += 1
    
    if (newFailStreak === 3) {
      newLevel = Math.max(0, newLevel - 1)
      newFailStreak = 0
    }
  }

  return {
    card: {
      ...card,
      level: newLevel,
      winStreak: newWinStreak,
      failStreak: newFailStreak
    },
    willLevelUp,
    newLevel,
    newWinStreak,
    newFailStreak
  }
}

const determineRating = (attempts: number): Rating => {
  switch (attempts) {
    case 1: return Rating.Good
    case 2: return Rating.Hard
    default: return Rating.Again
  }
}

export function useCardManagement() {
  const updateCard = async (
    card: CountryCard,
    isCorrect: boolean,
    isFirstTry: boolean,
    attempts: number
  ): Promise<CountryCard> => {
    const updateResult = calculateCardUpdate(card, isCorrect, isFirstTry)
    const rating = determineRating(attempts)

    const f = fsrs()
    const result = f.next(updateResult.card, new Date(), rating)

    const finalCard = {
      ...result.card,
      countryName: card.countryName,
      winStreak: updateResult.card.winStreak,
      failStreak: updateResult.card.failStreak,
      level: updateResult.card.level,
      ...(updateResult.willLevelUp && { 
        due: new Date(new Date().getTime() + (attempts === 1 ? 30 : 10) * 1000) 
      })
    }

    return finalCard
  }

  const createNewCard = (countryName: string): CountryCard => {
    const emptyCard = createEmptyCard()
    return {
      ...emptyCard,
      countryName,
      winStreak: 0,
      failStreak: 0,
      level: 0
    }
  }

  return {
    updateCard,
    createNewCard
  }
} 