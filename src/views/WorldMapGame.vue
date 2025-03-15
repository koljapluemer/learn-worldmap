<script setup lang="ts">
import { onMounted } from 'vue'
import type { GeographyLearning } from '../composables/useGeographyLearning'
import WorldMap from '../components/WorldMap.vue'
import { useGeographyLearning } from '../composables/useGeographyLearning'

const {
  currentCountry,
  message,
  isHighlighted,
  setAvailableCountries,
  selectRandomCountry,
  handleCountryClick
}: GeographyLearning = useGeographyLearning()

// Listen for available countries from the map component
const onMapLoaded = (countries: string[]) => {
  setAvailableCountries(countries)
  selectRandomCountry()
}

onMounted(async () => {
  // Initial setup - countries will be populated when map loads
  setAvailableCountries([])
  await selectRandomCountry()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Message Box -->
    <div class="mb-4 p-4 bg-base-200 rounded-lg shadow-lg text-center text-lg font-semibold">
      {{ message }}
    </div>

    <!-- Map Container -->
    <div class="w-full h-[80vh] bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <WorldMap
        :highlight-country="isHighlighted ? currentCountry || undefined : undefined"
        highlight-color="#ff6b6b"
        @country-click="handleCountryClick"
        @map-loaded="onMapLoaded"
      />
    </div>
  </div>
</template>

