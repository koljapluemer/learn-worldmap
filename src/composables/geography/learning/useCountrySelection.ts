import type { CountryCard } from '../../../useDexie'
import type { LearningState } from '../core/types'
import { useCardManagement } from '../card/useCardManagement'

interface CountrySelectionProps {
  state: LearningState
  getDueCards: () => Promise<CountryCard[]>
  getAllCards: () => Promise<CountryCard[]>
  saveCard: (card: CountryCard) => Promise<void>
}

export function useCountrySelection({
  state,
  getDueCards,
  getAllCards,
  saveCard
}: CountrySelectionProps) {
  const { createNewCard } = useCardManagement()

  const selectFromDueCards = async (dueCards: CountryCard[]): Promise<boolean> => {
    const availableDueCards = dueCards.filter(card => 
      card.countryName !== state.lastPlayedCountry
    )
    
    if (availableDueCards.length > 0) {
      const randomDueCard = availableDueCards[Math.floor(Math.random() * availableDueCards.length)]
      state.targetCountryToClick = randomDueCard.countryName
      state.lastPlayedCountry = randomDueCard.countryName
      return true
    }
    
    return false
  }

  const selectFromUnseenCountries = async (): Promise<boolean> => {
    const allCards = await getAllCards()
    const seenCountries = new Set(allCards.map(card => card.countryName))
    const unseenCountries = state.availableCountries.filter(country => 
      !seenCountries.has(country) && country !== state.lastPlayedCountry
    )
    
    if (unseenCountries.length > 0) {
      const randomIndex = Math.floor(Math.random() * unseenCountries.length)
      const selectedCountry = unseenCountries[randomIndex]
      
      const newCard = createNewCard(selectedCountry)
      await saveCard(newCard)
      
      state.targetCountryToClick = selectedCountry
      state.lastPlayedCountry = selectedCountry
      state.message = `Click ${state.targetCountryToClick}`
      return true
    }
    
    return false
  }

  const selectRandomCountry = async (): Promise<void> => {
    state.targetCountryIsHighlighted = false
    state.isFirstTry = true
    
    const dueCards = await getDueCards()
    
    if (await selectFromDueCards(dueCards)) return
    if (await selectFromUnseenCountries()) return
    
    // If all countries have been seen, pick a random one that's not the last played
    const availableForRandom = state.availableCountries.filter(country => 
      country !== state.lastPlayedCountry
    )
    
    const randomIndex = Math.floor(Math.random() * availableForRandom.length)
    state.targetCountryToClick = availableForRandom[randomIndex]
    state.lastPlayedCountry = state.targetCountryToClick
    state.message = `Click ${state.targetCountryToClick}`
  }

  return {
    selectRandomCountry
  }
} 