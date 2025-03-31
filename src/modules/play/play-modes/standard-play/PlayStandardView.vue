<script setup lang="ts">
import { onMounted } from 'vue'
import WorldMapGame from '../components/WorldMapGame.vue'
import { useGeographyLearning } from '../composables/useGeographyLearning'
import { useLearningProgress } from '../composables/useLearningProgress'
import { availableCountries, loadMapData } from '../modules/map-data/mapData'

const { targetCountryToClick, handleGameCompletion, setAvailableCountries, selectRandomCountry } = useGeographyLearning()
const { setAvailableCountries: setProgressCountries, updateProgress } = useLearningProgress()

const handleGameComplete = async ({ country, attempts }: { country: string, attempts: number }) => {
  await handleGameCompletion(country, attempts)
  await updateProgress()
}

// Load map data and initialize game
onMounted(async () => {
  await loadMapData()
  setAvailableCountries(availableCountries.value)
  setProgressCountries(availableCountries.value)
  await updateProgress()
  selectRandomCountry()
})
</script>

<template>
  <div class="container mx-auto">
    <!-- Game Component -->
    <WorldMapGame
      v-if="targetCountryToClick"
      :target-country-to-click="targetCountryToClick"
      @game-complete="handleGameComplete"
    />
  </div>
</template> 