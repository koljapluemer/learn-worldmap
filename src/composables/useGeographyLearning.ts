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
  const { getCard, saveCard, getDueCards, getAllCards } = useDexie()
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
    
    // First check for due cards
    const dueCards = await getDueCards()
    console.log(`Found ${dueCards.length} due cards`)
    
    if (dueCards.length > 0) {
      // Randomly select one of the due cards
      const randomDueCard = dueCards[Math.floor(Math.random() * dueCards.length)]
      targetCountryToClick.value = randomDueCard.countryName
      console.log(`Selected due card: ${targetCountryToClick.value}, due at: ${randomDueCard.due.toISOString()}`)
    } else {
      // If no due cards, get all cards to find unseen countries
      const allCards = await getAllCards()
      const seenCountries = new Set(allCards.map(card => card.countryName))
      const unseenCountries = availableCountries.value.filter(country => !seenCountries.has(country))
      console.log(`Found ${unseenCountries.length} unseen countries`)
      
      if (unseenCountries.length > 0) {
        // Randomly select an unseen country
        const randomIndex = Math.floor(Math.random() * unseenCountries.length)
        const selectedCountry = unseenCountries[randomIndex]
        
        // Create and save empty card for the new country
        const emptyCard = createEmptyCard()
        const newCard = {
          ...emptyCard,
          countryName: selectedCountry,
          winStreak: 0,
          failStreak: 0
        } as CountryCard
        await saveCard(newCard)
        console.log(`Created new card for unseen country: ${selectedCountry}`)
        
        targetCountryToClick.value = selectedCountry
      } else {
        // If all countries have been seen, just pick a random one
        const randomIndex = Math.floor(Math.random() * availableCountries.value.length)
        targetCountryToClick.value = availableCountries.value[randomIndex]
        console.log(`All countries seen, selected random country: ${targetCountryToClick.value}`)
      }
    }
    
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
    if (!card) {
      console.error('Card not found for country:', country)
      return
    }

    const f = fsrs()
    if (attempts === 1) {
      card.winStreak = (card.winStreak || 0) + 1
      card.failStreak = 0
    } else {
      card.winStreak = 0
      card.failStreak = (card.failStreak || 0) + 1
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

      // Get card (it should exist now)
      let card = await getCard(clickedCountry)
      if (!card) {
        console.error('Card not found for country:', clickedCountry)
        return
      }

      const f = fsrs()
      updateCardStreaks(card, true, isFirstTry.value)

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
        if (!card) {
          console.error('Card not found for country:', targetCountryToClick.value)
          return
        }

        const f = fsrs()
        updateCardStreaks(card, false, false)

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