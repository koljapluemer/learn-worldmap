import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { db } from '../db/database'
import type { CountryCard } from '../db/database'
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'

export interface GeographyLearning {
  currentCountry: ComputedRef<string | null>
  message: ComputedRef<string>
  isHighlighted: ComputedRef<boolean>
  setAvailableCountries: (countries: string[]) => void
  selectRandomCountry: () => Promise<void>
  handleCountryClick: (country: string) => Promise<void>
}

export function useGeographyLearning(): GeographyLearning {
  const currentCountry = ref<string | null>(null)
  const message = ref<string>('')
  const isHighlighted = ref(false)
  const isFirstTry = ref(true)
  const availableCountries = ref<string[]>([])

  const setAvailableCountries = (countries: string[]) => {
    availableCountries.value = countries
  }

  const selectRandomCountry = async () => {
    // Reset state for new country
    isHighlighted.value = false
    isFirstTry.value = true
    
    // Get a random country from the available list
    const randomIndex = Math.floor(Math.random() * availableCountries.value.length)
    currentCountry.value = availableCountries.value[randomIndex]
    message.value = `Click ${currentCountry.value}`
  }

  const handleCountryClick = async (clickedCountry: string) => {
    if (!currentCountry.value) return

    if (clickedCountry === currentCountry.value) {
      // Correct click
      let rating: Rating
      if (isFirstTry.value) {
        rating = Rating.Good
        message.value = `Correct! That's ${clickedCountry}!`
      } else {
        rating = Rating.Hard
        message.value = `Good job finding ${clickedCountry} on the second try!`
      }

      // Update or create card in database
      let card = await db.countryCards.get(clickedCountry)
      const f = fsrs()
      
      if (!card) {
        // First time seeing this country
        const emptyCard = createEmptyCard()
        card = { ...emptyCard, countryName: clickedCountry } as CountryCard
      }

      const result = f.next(card, new Date(), rating)
      await db.countryCards.put({ ...result.card, countryName: clickedCountry })

      // Select next country after a short delay
      setTimeout(selectRandomCountry, 2000)
    } else {
      // Incorrect click
      if (isFirstTry.value) {
        isFirstTry.value = false
        isHighlighted.value = true
        message.value = `Nope, ${currentCountry.value} is highlighted now. Try again!`
      } else {
        // Failed second attempt
        message.value = `That's not quite right. ${currentCountry.value} was highlighted.`
        
        // Update card with Rating.Again
        let card = await db.countryCards.get(currentCountry.value)
        const f = fsrs()
        
        if (!card) {
          const emptyCard = createEmptyCard()
          card = { ...emptyCard, countryName: currentCountry.value } as CountryCard
        }

        const result = f.next(card, new Date(), Rating.Again)
        await db.countryCards.put({ ...result.card, countryName: currentCountry.value })

        // Move to next country after a delay
        setTimeout(selectRandomCountry, 2000)
      }
    }
  }

  return {
    currentCountry: computed(() => currentCountry.value),
    message: computed(() => message.value),
    isHighlighted: computed(() => isHighlighted.value),
    setAvailableCountries,
    selectRandomCountry,
    handleCountryClick
  }
} 