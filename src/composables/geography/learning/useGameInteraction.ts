import type { CountryCard } from '../../../useDexie'
import type { LearningState } from '../core/types'
import { useCardManagement } from '../card/useCardManagement'

interface GameInteractionProps {
  state: LearningState
  getCard: (country: string) => Promise<CountryCard | null>
  saveCard: (card: CountryCard) => Promise<void>
  selectRandomCountry: () => Promise<void>
}

export function useGameInteraction({
  state,
  getCard,
  saveCard,
  selectRandomCountry
}: GameInteractionProps) {
  const { updateCard } = useCardManagement()

  const handleCorrectClick = async (clickedCountry: string): Promise<void> => {
    const card = await getCard(clickedCountry)
    if (!card) {
      console.error('Card not found for country:', clickedCountry)
      return
    }

    const finalCard = await updateCard(card, true, state.isFirstTry, 1)
    await saveCard(finalCard)

    window.dispatchEvent(new Event('learning-progress-update'))
    setTimeout(selectRandomCountry, 2000)
  }

  const handleIncorrectClick = async (clickedCountry: string): Promise<void> => {
    if (state.isFirstTry) {
      state.isFirstTry = false
      state.targetCountryIsHighlighted = true
      state.message = `Nope, ${state.targetCountryToClick} is highlighted now. Try again!`
    } else {
      state.message = `That's not quite right. ${state.targetCountryToClick} was highlighted.`
      
      const card = await getCard(state.targetCountryToClick!)
      if (!card) {
        console.error('Card not found for country:', state.targetCountryToClick)
        return
      }

      const finalCard = await updateCard(card, false, false, 3)
      await saveCard(finalCard)

      window.dispatchEvent(new Event('learning-progress-update'))
      setTimeout(selectRandomCountry, 2000)
    }
  }

  const handleCountryClick = async (clickedCountry: string): Promise<void> => {
    if (!state.targetCountryToClick) return

    if (clickedCountry === state.targetCountryToClick) {
      await handleCorrectClick(clickedCountry)
    } else {
      await handleIncorrectClick(clickedCountry)
    }
  }

  const handleGameCompletion = async (country: string, attempts: number): Promise<void> => {
    const card = await getCard(country)
    if (!card) {
      console.error('Card not found for country:', country)
      return
    }

    const finalCard = await updateCard(card, true, attempts === 1, attempts)
    await saveCard(finalCard)

    window.dispatchEvent(new Event('learning-progress-update'))
    setTimeout(selectRandomCountry, 2000)
  }

  return {
    handleCountryClick,
    handleGameCompletion
  }
} 