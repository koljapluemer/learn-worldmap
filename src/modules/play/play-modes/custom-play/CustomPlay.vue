<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onMounted } from 'vue'
import { useGeographyLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useGeographyLearning'
import { useLearningProgress } from '@/modules/play/play-modes/standard-play/standard-play-progress-bar/useLearningProgress'
import { availableCountries, loadMapData } from '@/modules/map-data/mapData'
import worldGeoJson from '@/modules/map-data/woldmap.geo.json'
import type { GeoJSONFeature } from '@/modules/map-data/types'
import WorldMapGame from '@/modules/play/map-renderer/WorldMapGame.vue'
import { useContinentSelection } from './useContinentSelection'
import FilterModal from './filter-modal/FilterModal.vue'

const props = defineProps<{
  initialContinents?: string[]
}>()

const { targetCountryToClick, handleGameCompletion, setAvailableCountries, selectRandomCountry } = useGeographyLearning()
const { setAvailableCountries: setProgressCountries, updateProgress } = useLearningProgress()

// Get continent selection from composable
const { selectedContinents, availableContinents, toggleContinent, isSelected, setContinents } = useContinentSelection()

// Modal state
const isModalOpen = ref(false)

// Initialize continents from GeoJSON
onMounted(async () => {
  await loadMapData()
  
  // If initial continents are provided, try to match them with available continents
  if (props.initialContinents?.length) {
    const normalizedInitial = props.initialContinents.map(c => 
      c.toLowerCase().replace(/[^a-z]/g, '')
    )
    
    const matchedContinents = availableContinents.filter(continent => {
      const normalizedContinent = continent.toLowerCase().replace(/[^a-z]/g, '')
      return normalizedInitial.some(initial => normalizedContinent.includes(initial))
    })
    
    if (matchedContinents.length > 0) {
      setContinents(matchedContinents)
    }
  }
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
    <!-- Filter Button -->
    <div class="my-4 w-full">
      <button 
        class="btn btn-primary gap-2 w-full"
        @click="isModalOpen = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
        </svg>
        Filter Countries
      </button>
    </div>

    <!-- Game Component -->
    <WorldMapGame
      v-if="targetCountryToClick"
      :target-country-to-click="targetCountryToClick"
      @game-complete="handleGameComplete"
      :allow-more-than-one-attempt="true"
    />

    <!-- Filter Modal -->
    <FilterModal
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>
