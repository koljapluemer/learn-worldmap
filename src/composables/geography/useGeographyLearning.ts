import { ref, computed } from 'vue'
import { useDexie } from '../useDexie'
import type { GeographyLearning, LearningState } from './core/types'
import { useCountrySelection } from './learning/useCountrySelection'
import { useGameInteraction } from './learning/useGameInteraction'

export function useGeographyLearning(): GeographyLearning {
  const { getCard, saveCard, getDueCards, getAllCards } = useDexie()
  
  const state = ref<LearningState>({
    targetCountryToClick: null,
    message: '',
    targetCountryIsHighlighted: false,
    isFirstTry: true,
    availableCountries: [],
    lastPlayedCountry: null
  })

  const setAvailableCountries = (countries: string[]): void => {
    state.value.availableCountries = countries
  }

  const { selectRandomCountry } = useCountrySelection({
    state: state.value,
    getDueCards,
    getAllCards,
    saveCard
  })

  const { handleCountryClick, handleGameCompletion } = useGameInteraction({
    state: state.value,
    getCard,
    saveCard,
    selectRandomCountry
  })

  return {
    targetCountryToClick: computed(() => state.value.targetCountryToClick),
    message: computed(() => state.value.message),
    targetCountryIsHighlighted: computed(() => state.value.targetCountryIsHighlighted),
    setAvailableCountries,
    selectRandomCountry,
    handleCountryClick,
    handleGameCompletion
  }
} 