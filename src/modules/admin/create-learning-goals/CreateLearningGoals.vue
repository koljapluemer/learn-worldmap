<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorldMap from '@/modules/map-renderer/WorldMap.vue'
import countryList from '@/modules/map-data/country-lists/all-countries.json'

// Component state
const selectedCountry = ref('')

// Props and emits
defineProps<{
  // Add props if needed
}>()

defineEmits<{
  // Add emits if needed
}>()

function pickRandomCountry() {
  const idx = Math.floor(Math.random() * countryList.length)
  selectedCountry.value = countryList[idx]
}

onMounted(() => {
  pickRandomCountry()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Create Learning Goals</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Map Section -->
      <div class="bg-base-200 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
        <div class="worldmap-scale-wrapper">
          <WorldMap
            :isInteractive="false"
            :countryToHighlight="selectedCountry"
            :highlightColor="'#3b82f6'"
          />
        </div>
      </div>

      <!-- Controls Section -->
      <div class="bg-base-200 p-4 rounded-lg flex flex-col items-start">
        <button class="btn btn-primary mb-4" @click="pickRandomCountry">Random Country</button>
        <div class="text-lg">Current: <span class="font-bold">{{ selectedCountry }}</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.worldmap-scale-wrapper {
  transform: scale(0.3);
  transform-origin: top left;
  width: 1500px; /* Adjust to match SVG's natural width */
  height: 750px; /* Adjust to match SVG's natural height */
  pointer-events: none; /* disables interaction */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
