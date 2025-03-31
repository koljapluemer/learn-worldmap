<script setup lang="ts">
import { onMounted } from 'vue'
import { useGeographyLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useGeographyLearning'
import { useLearningProgress } from './standard-play-progress-bar/useLearningProgress'
import { availableCountries, loadMapData } from '@/modules/map-data/mapData'
import WorldMapGame from '../../map-renderer/WorldMapGame.vue'

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