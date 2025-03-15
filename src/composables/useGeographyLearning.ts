import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'
import { useDexie, type CountryCard } from './useDexie'

export interface GeographyLearning {
  targetCountryToClick: ComputedRef<string | null>
  targetCountryIsHighlighted: ComputedRef<boolean>
  message: ComputedRef<string>
  setAvailableCountries: (countries: string[]) => void
  selectRandomCountry: () => Promise<void>
  handleCountryClick: (country: string) => Promise<void>
  handleGameCompletion: (country: string, attempts: number) => Promise<void>
}

export function useGeographyLearning(): GeographyLearning {
  const { getCard, saveCard } = useDexie()
  const targetCountryToClick = ref<string | null>(null)
  const message = ref<string>('')
  const targetCountryIsHighlighted = ref(false)
  const isFirstTry = ref(true)
  const availableCountries = ref<string[]>([])

  const setAvailableCountries = (countries: string[]) => {
    availableCountries.value = countries
  }

  const selectRandomCountry = async () => {
    // Reset state for new country
    targetCountryIsHighlighted.value = false
    isFirstTry.value = true
    
    // Get a random country from the available list
    const randomIndex = Math.floor(Math.random() * availableCountries.value.length)
    targetCountryToClick.value = availableCountries.value[randomIndex]
    message.value = `Click ${targetCountryToClick.value}`
  }

  const updateCardStreaks = (card: CountryCard, isCorrect: boolean, isFirstTry: boolean): void => {
    if (!card.winStreak) card.winStreak = 0
    if (!card.failStreak) card.failStreak = 0

    if (isCorrect) {
      if (isFirstTry) {
        card.winStreak += 1
        card.failStreak = 0
      } else {
        card.winStreak = 0
        card.failStreak += 1
      }
    } else {
      card.winStreak = 0
      card.failStreak += 1
    }
  }

  const handleGameCompletion = async (country: string, attempts: number) => {
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

    let card = await getCard(country)
    const f = fsrs()
    
    if (!card) {
      const emptyCard = createEmptyCard()
      card = { 
        ...emptyCard, 
        countryName: country,
        winStreak: attempts === 1 ? 1 : 0,
        failStreak: attempts === 1 ? 0 : 1
      } as CountryCard
    } else {
      if (attempts === 1) {
        card.winStreak = (card.winStreak || 0) + 1
        card.failStreak = 0
      } else {
        card.winStreak = 0
        card.failStreak = (card.failStreak || 0) + 1
      }
    }

    const result = f.next(card, new Date(), rating)
    await saveCard({ 
      ...result.card, 
      countryName: country,
      winStreak: card.winStreak,
      failStreak: card.failStreak
    })

    // Select next country after a delay
    setTimeout(selectRandomCountry, 2000)
  }

  const handleCountryClick = async (clickedCountry: string) => {
    if (!targetCountryToClick.value) return

    if (clickedCountry === targetCountryToClick.value) {
      // Correct click
      let rating: Rating
      if (isFirstTry.value) {
        rating = Rating.Good
        message.value = `Correct! That's ${clickedCountry}!`
      } else {
        rating = Rating.Hard
        message.value = `Good job finding ${clickedCountry} on the second try!`
      }

      // Get or create card
      let card = await getCard(clickedCountry)
      const f = fsrs()
      
      if (!card) {
        // First time seeing this country
        const emptyCard = createEmptyCard()
        card = { 
          ...emptyCard, 
          countryName: clickedCountry,
          winStreak: isFirstTry.value ? 1 : 0,
          failStreak: isFirstTry.value ? 0 : 1
        } as CountryCard
      } else {
        updateCardStreaks(card, true, isFirstTry.value)
      }

      const result = f.next(card, new Date(), rating)
      await saveCard({ 
        ...result.card, 
        countryName: clickedCountry,
        winStreak: card.winStreak,
        failStreak: card.failStreak
      })

      // Select next country after a short delay
      setTimeout(selectRandomCountry, 2000)
    } else {
      // Incorrect click
      if (isFirstTry.value) {
        isFirstTry.value = false
        targetCountryIsHighlighted.value = true
        message.value = `Nope, ${targetCountryToClick.value} is highlighted now. Try again!`
      } else {
        // Failed second attempt
        message.value = `That's not quite right. ${targetCountryToClick.value} was highlighted.`
        
        let card = await getCard(targetCountryToClick.value)
        const f = fsrs()
        
        if (!card) {
          const emptyCard = createEmptyCard()
          card = { 
            ...emptyCard, 
            countryName: targetCountryToClick.value,
            winStreak: 0,
            failStreak: 1
          } as CountryCard
        } else {
          updateCardStreaks(card, false, false)
        }

        const result = f.next(card, new Date(), Rating.Again)
        await saveCard({ 
          ...result.card, 
          countryName: targetCountryToClick.value,
          winStreak: card.winStreak,
          failStreak: card.failStreak
        })

        // Move to next country after a delay
        setTimeout(selectRandomCountry, 2000)
      }
    }
  }

  return {
    targetCountryToClick: computed(() => targetCountryToClick.value),
    message: computed(() => message.value),
    targetCountryIsHighlighted: computed(() => targetCountryIsHighlighted.value),
    setAvailableCountries,
    selectRandomCountry,
    handleCountryClick,
    handleGameCompletion
  }
} 