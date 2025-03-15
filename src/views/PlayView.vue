<script setup lang="ts">
import { onMounted } from 'vue'
import WorldMapGame from '../components/WorldMapGame.vue'
import { useGeographyLearning } from '../composables/useGeographyLearning'
import { availableCountries, loadMapData } from '../services/mapData'

const { targetCountryToClick, handleGameCompletion, setAvailableCountries, selectRandomCountry } = useGeographyLearning()

const handleGameComplete = async ({ country, attempts }: { country: string, attempts: number }) => {
  await handleGameCompletion(country, attempts)
}

// Load map data and initialize game
onMounted(async () => {
  await loadMapData()
  setAvailableCountries(availableCountries.value)
  selectRandomCountry()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Game Component -->
    <WorldMapGame
      v-if="targetCountryToClick"
      :target-country-to-click="targetCountryToClick"
      @game-complete="handleGameComplete"
    />
  </div>
</template> 