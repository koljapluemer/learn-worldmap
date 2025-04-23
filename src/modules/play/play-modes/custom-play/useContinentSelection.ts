import { ref, watch } from 'vue'
import { getAvailableContinents } from '@/modules/map-data/mapData'

const STORAGE_KEY = 'selected-continents'

export function useContinentSelection() {
  const selectedContinents = ref<string[]>([])
  const availableContinents = getAvailableContinents()

  // Load from localStorage on initialization
  const loadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Only use stored values that are still in available continents
        selectedContinents.value = parsed.filter((c: string) => availableContinents.includes(c))
        // If no valid selections, select all continents
        if (selectedContinents.value.length === 0) {
          selectedContinents.value = [...availableContinents]
        }
      } catch (e) {
        console.error('Failed to parse stored continents:', e)
        selectedContinents.value = [...availableContinents]
      }
    } else {
      // If nothing stored, select all continents by default
      selectedContinents.value = [...availableContinents]
    }
  }

  // Save to localStorage whenever selection changes
  watch(selectedContinents, (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  }, { deep: true })

  // Load initial state
  loadFromStorage()

  const toggleContinent = (continent: string) => {
    if (selectedContinents.value.includes(continent)) {
      selectedContinents.value = selectedContinents.value.filter(c => c !== continent)
    } else {
      selectedContinents.value.push(continent)
    }
  }

  const setContinents = (continents: string[]) => {
    selectedContinents.value = continents.filter(c => availableContinents.includes(c))
  }

  const isSelected = (continent: string) => {
    return selectedContinents.value.includes(continent)
  }

  return {
    selectedContinents,
    availableContinents,
    toggleContinent,
    setContinents,
    isSelected
  }
} 