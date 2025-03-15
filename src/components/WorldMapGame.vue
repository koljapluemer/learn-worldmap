<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import WorldMap from './WorldMap.vue'

const props = defineProps<{
  targetCountryToClick: string
}>()

const emit = defineEmits<{
  (e: 'gameComplete', result: { country: string, attempts: number }): void
}>()

// Game state
const attempts = ref(0)
const countryToHighlight = ref<string | undefined>(undefined)
const highlightColor = ref<string>('#3b82f6') // Default blue
const useCircleAroundHighlight = ref(false)


const feedbackMessage = ref(`Find ${props.targetCountryToClick} on the map`)

const handleMapClicked = (touchedCountries: string[]) => {
  attempts.value++
  
  if (touchedCountries.includes(props.targetCountryToClick)) {
    // Correct country found
    countryToHighlight.value = props.targetCountryToClick
    highlightColor.value = '#22c55e' // Green
    useCircleAroundHighlight.value = true

    if (attempts.value === 1) {
      feedbackMessage.value = `That's ${props.targetCountryToClick}. First try!`
    } else {
      feedbackMessage.value = `You found ${props.targetCountryToClick} after ${attempts.value} tries.`
    }
    
    emit('gameComplete', { 
      country: props.targetCountryToClick, 
      attempts: attempts.value 
    })
  } else {
    // Wrong country - highlight target after first miss
    feedbackMessage.value = `${props.targetCountryToClick} is here, try again.`
    if (attempts.value === 1) {
      countryToHighlight.value = props.targetCountryToClick
      highlightColor.value = '#3b82f6' // Blue
      useCircleAroundHighlight.value = true
    }
  }
}

// Reset game state when target country changes
watch(() => props.targetCountryToClick, () => {
  attempts.value = 0
  feedbackMessage.value = `Find ${props.targetCountryToClick} on the map`
  countryToHighlight.value = undefined
  highlightColor.value = '#3b82f6'
  useCircleAroundHighlight.value = false
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Game Messages -->
    <div class="space-y-2">
      <!-- Instructions -->
      <div class="text-lg font-semibold text-center">
        {{ feedbackMessage }}
      </div>
      

    </div>

    <!-- Map Container -->
    <div class="w-full h-[80vh] bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <WorldMap
        :country-to-highlight="countryToHighlight"
        :highlight-color="highlightColor"
        :use-circle-around-highlight="useCircleAroundHighlight"
        @map-clicked="handleMapClicked"
      />
    </div>
  </div>
</template> 