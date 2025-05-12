<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onMounted } from 'vue'
import { useGeographyLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useGeographyLearning'
import { useLearningProgress } from '@/modules/play/play-modes/standard-play/standard-play-progress-bar/useLearningProgress'
import { availableCountries, loadMapData } from '@/modules/map-data/mapData'
import WorldMapGame from '@/modules/play/map-renderer/WorldMapGame.vue'
import FilterModal from './filter-modal/FilterModal.vue'
import { useCountrySelection } from './filter-modal/tabs/useCountrySelection'



const { targetCountryToClick, handleGameCompletion, setAvailableCountries, selectRandomCountry } = useGeographyLearning()
const { setAvailableCountries: setProgressCountries, updateProgress } = useLearningProgress()


// Get country selection from composable
const { selectedCountries } = useCountrySelection()

// Modal state
const isModalOpen = ref(false)

// Initialize continents from GeoJSON
onMounted(async () => {
  await loadMapData()
  

})

// Filtered countries based on selected countries
const filteredCountries = computed(() => {
  return availableCountries.value.filter(country => selectedCountries.value.includes(country))
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


</script>

<template>
  <div class="container mx-auto">
    <!-- Filter Button -->
    <div class="p-4 w-full">
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
      v-if="targetCountryToClick && selectedCountries.length > 0"
      :target-country-to-click="targetCountryToClick"
      @game-complete="handleGameComplete"
      :allow-more-than-one-attempt="true"
    />

    <!-- show simple! warning if no countries are selected -->
    <div v-if="selectedCountries.length === 0" class="p-4 w-full">
      <div class="alert alert-warning">
        <div class="flex-1">
          Please select at least one country
        </div>
      </div>
    </div>

    <!-- Filter Modal -->
    <FilterModal
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>
