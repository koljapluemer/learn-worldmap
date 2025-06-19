import { ref, computed, watch } from 'vue'
import allCountries from '@/modules/map-data/country-lists/all-countries.json'

const STORAGE_KEY = 'customPlayCountries'

// Initialize from localStorage or default to all countries selected
const initializeCountrySelection = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  // Default: all countries selected
  const defaultSelection = Object.fromEntries(
    allCountries.map(country => [country, true])
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSelection))
  return defaultSelection
}

const countrySelection = ref<Record<string, boolean>>(initializeCountrySelection())

const selectedCountries = computed(() => 
  Object.entries(countrySelection.value)
    .filter(([, selected]) => selected)
    .map(([country]) => country)
)

// Computed property for total selected count
const selectedCount = computed(() => selectedCountries.value.length)

// Toggle country selection
const toggleCountry = (country: string) => {
  countrySelection.value[country] = !countrySelection.value[country]
}

// Check if at least one country is selected
const hasSelectedCountries = computed(() => selectedCount.value > 0)

// Watch for changes and persist to localStorage
watch(countrySelection, (newValue) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
}, { deep: true })

export function useCountrySelection() {
  return {
    countrySelection,
    selectedCountries,
    selectedCount,
    toggleCountry,
    hasSelectedCountries
  }
} 