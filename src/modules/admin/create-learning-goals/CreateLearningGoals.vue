<script setup lang="ts">
import { ref } from 'vue'
import WorldMap from '@/modules/map-renderer/WorldMap.vue'

// Component state
const selectedCountry = ref<string>('')

// Props and emits
defineProps<{
  // Add props if needed
}>()

defineEmits<{
  // Add emits if needed
}>()
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
      <div class="bg-base-200 p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Learning Goals Configuration</h2>
        <!-- Add your controls here -->
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
