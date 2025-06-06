<script setup lang="ts">
import { computed, watch } from 'vue'
import { useGeographyLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useGeographyLearning'
import { useLearningProgress } from '@/modules/standard-play-progress-bar/useLearningProgress'
import WorldMapGame from '@/modules/map-renderer/WorldMapGame.vue'
import { useCountrySelection } from '@/modules/filter-view/selections/useCountrySelection'

import allCountries from '@/modules/map-data/country-lists/all-countries.json'

const { targetCountryToClick, handleGameCompletion, setAvailableCountries, selectRandomCountry } = useGeographyLearning()
const { setAvailableCountries: setProgressCountries, updateProgress } = useLearningProgress()


// Get country selection from composable
const { selectedCountries } = useCountrySelection()

// Modal state

// Filtered countries based on selected countries
const filteredCountries = computed(() => {
  return allCountries.filter(country => selectedCountries.value.includes(country))
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
  <main>
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


  </main>
</template>
