import type { ComputedRef } from 'vue'
import type { CountryCard } from '../../useDexie'

export interface GeographyLearning {
  targetCountryToClick: ComputedRef<string | null>
  targetCountryIsHighlighted: ComputedRef<boolean>
  message: ComputedRef<string>
  setAvailableCountries: (countries: string[]) => void
  selectRandomCountry: () => Promise<void>
  handleCountryClick: (country: string) => Promise<void>
  handleGameCompletion: (country: string, attempts: number) => Promise<void>
}

export interface LearningState {
  targetCountryToClick: string | null
  message: string
  targetCountryIsHighlighted: boolean
  isFirstTry: boolean
  availableCountries: string[]
  lastPlayedCountry: string | null
}

export interface CardUpdateResult {
  card: CountryCard
  willLevelUp: boolean
  newLevel: number
  newWinStreak: number
  newFailStreak: number
} 