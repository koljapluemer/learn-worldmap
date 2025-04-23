<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onMounted } from 'vue'
import { useGeographyLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useGeographyLearning'
import { useLearningProgress } from '@/modules/play/play-modes/standard-play/standard-play-progress-bar/useLearningProgress'
import { availableCountries, loadMapData } from '@/modules/map-data/mapData'
import worldGeoJson from '@/modules/map-data/woldmap.geo.json'
import type { GeoJSONFeature } from '@/modules/map-data/types'
import WorldMapGame from '@/modules/play/map-renderer/WorldMapGame.vue'
import ContinentFilter from './ContinentFilter.vue'
import { useContinentSelection } from './useContinentSelection'

const { targetCountryToClick, handleGameCompletion, setAvailableCountries, selectRandomCountry } = useGeographyLearning()
const { setAvailableCountries: setProgressCountries, updateProgress } = useLearningProgress()

// Get continent selection from composable
const { selectedContinents, availableContinents, toggleContinent, isSelected } = useContinentSelection()

// Initialize continents from GeoJSON
onMounted(async () => {
  await loadMapData()
})

// Filtered countries based on selected continents
const filteredCountries = computed(() => {
  if (selectedContinents.value.length === 0) return availableCountries.value
  return availableCountries.value.filter(country => {
    const countryData = (worldGeoJson as { features: GeoJSONFeature[] }).features.find(f => f.properties.name === country)
    return countryData && selectedContinents.value.includes(countryData.properties.continent)
  })
})

const handleGameComplete = async ({ country, attempts }: { country: string, attempts: number }) => {
  await handleGameCompletion(country, attempts)
  await updateProgress()
}

// Update game state when filtered countries change
watch(filteredCountries, (newVal) => {
  setAvailableCountries(newVal)
  setProgressCountries(newVal)
  selectRandomCountry()
}, { immediate: true })

// Handle continent toggle
const handleContinentToggle = (continent: string) => {
  toggleContinent(continent)
}
</script>

<template>
  <div class="container mx-auto">
    <!-- Continent Filter -->
    <div class="mb-4">
      <ContinentFilter
        :available-continents="availableContinents"
        :selected-continents="selectedContinents"
        :on-toggle="handleContinentToggle"
      />
    </div>

    <!-- Game Component -->
    <WorldMapGame
      v-if="targetCountryToClick"
      :target-country-to-click="targetCountryToClick"
      @game-complete="handleGameComplete"
      :allow-more-than-one-attempt="true"
    />
  </div>
</template>
