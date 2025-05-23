<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGeographyLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useGeographyLearning'
import { useLearningProgress } from '@/modules/standard-play-progress-bar/useLearningProgress'
import WorldMapGame from '@/modules/map-renderer/WorldMapGame.vue'
import FilterModal from '@/modules/filter-modal/FilterModal.vue'
import { useCountrySelection } from '@/modules/filter-modal/selections/useCountrySelection'

import allCountries from '@/modules/map-data/country-lists/all-countries.json'
import IconFilter from '../icons/IconFilter.vue'
import IconSettings from '../icons/IconSettings.vue'
import IconStats from '../icons/IconStats.vue'

const { targetCountryToClick, handleGameCompletion, setAvailableCountries, selectRandomCountry } = useGeographyLearning()
const { setAvailableCountries: setProgressCountries, updateProgress } = useLearningProgress()


// Get country selection from composable
const { selectedCountries } = useCountrySelection()

// Modal state
const isFilterModalOpen = ref(false)
const isSettingsModalOpen = ref(false)
const isStatsModalOpen = ref(false)
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
  <header class="flex flex-row justify-between items-center p-1">
    <h1 class="font-bold">Learn the World Map</h1>

    <nav class="flex flex-row gap-2">
      <button 
        class="btn"
        @click="isFilterModalOpen = true"
      >
        <IconFilter />
        <span class="hidden md:block">Filter Countries</span>
      </button>
      <button 
        class="btn"
        @click="isSettingsModalOpen = true"
      >
        <IconSettings />
        <span class="hidden md:block">Settings</span>
      </button>
      <button 
        class="btn"
        @click="isStatsModalOpen = true"
      >
        <IconStats />
        <span class="hidden md:block">Stats</span>
      </button>
    </nav>
  </header>
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

    <!-- Filter Modal -->
    <FilterModal
      :is-open="isFilterModalOpen"
      @close="isFilterModalOpen = false"
    />
  </main>
</template>
