import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { db } from '../db/database'
import type { CountryCard } from '../db/database'
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'

export interface GeographyLearning {
  targetCountryToClick: ComputedRef<string | null>
  targetCountryIsHighlighted: ComputedRef<boolean>
  message: ComputedRef<string>
  setAvailableCountries: (countries: string[]) => void
  selectRandomCountry: () => Promise<void>
  handleCountryClick: (country: string) => Promise<void>
}

export function useGeographyLearning(): GeographyLearning {
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
        targetCountryIsHighlighted.value = true
        message.value = `Nope, ${targetCountryToClick.value} is highlighted now. Try again!`
      } else {
        // Failed second attempt
        message.value = `That's not quite right. ${targetCountryToClick.value} was highlighted.`
        
        // Update card with Rating.Again
        let card = await db.countryCards.get(targetCountryToClick.value)
        const f = fsrs()
        
        if (!card) {
          const emptyCard = createEmptyCard()
          card = { ...emptyCard, countryName: targetCountryToClick.value } as CountryCard
        }

        const result = f.next(card, new Date(), Rating.Again)
        await db.countryCards.put({ ...result.card, countryName: targetCountryToClick.value })

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
    handleCountryClick
  }
} 