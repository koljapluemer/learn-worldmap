<script setup lang="ts">
import { ref } from 'vue'
import WorldMap from '../components/WorldMap.vue'
import { useCustomCursor } from '../composables/useCustomCursor'
import { useSpacedRepetition } from '../composables/useSpacedRepetition'
import { useGeographyLearning } from '../composables/useGeographyLearning'
import { onMounted } from 'vue'

const { createOrUpdateCard } = useSpacedRepetition()
const { containerRef, cursor, isCursorOverlappingElement } = useCustomCursor(76)
const {
  currentCountry,
  message,
  isHighlighted,
  setAvailableCountries,
  selectRandomCountry,
  handleCountryClick
} = useGeographyLearning()

const handleCountryClick = (country: string) => {
  if (!cursor.value) return

  const cursorX = parseFloat(cursor.value.style.left)
  const cursorY = parseFloat(cursor.value.style.top)
  const franceElement = document.querySelector('.highlighted') as Element

  if (franceElement && isCursorOverlappingElement(franceElement, cursorX, cursorY)) {
    createOrUpdateCard({
      question: 'Where is France?',
      answer: 'France is a country in Western Europe',
      tags: ['geography', 'countries', 'europe']
    })
    alert('Correct! France has been added to your spaced repetition deck.')
  } else {
    alert('Try again! Click on France.')
  }
}

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

<style>
/* Global styles for cursor visibility */
body.hovering-map {
  cursor: none;
}

.custom-cursor {
  width: 76px;
  height: 76px;
  background: rgba(255, 107, 107, 0.2);
  border: 2px solid #ff6b6b;
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

body.hovering-map .custom-cursor {
  opacity: 1;
}

.custom-cursor::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #ff6b6b;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

@media (hover: none) {
  .custom-cursor {
    display: none;
  }
}
</style>

<style scoped>
.country {
  transition: fill 0.3s ease;
}

.country:hover {
  fill: #e2e8f0;
}

.france:hover {
  fill: #ff8787 !important;
}
</style> 