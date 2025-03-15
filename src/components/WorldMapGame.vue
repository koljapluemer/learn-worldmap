<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import WorldMap from './WorldMap.vue'
import { useDexie } from '../composables/useDexie'

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
const zoomLevel = ref(100) // Base zoom level in percentage
const { getCard, saveLearningEvent } = useDexie()

// Learning event tracking
const exerciseStartTime = ref<number>(0)
const firstClickTime = ref<number | null>(null)
const firstClickDistance = ref<number | null>(null)

const feedbackMessage = ref(`Find ${props.targetCountryToClick} on the map`)

// Initialize level-based settings when target country changes
const initializeCountryLevel = async () => {
  const card = await getCard(props.targetCountryToClick)
  const level = card?.level || 0
  
  // Handle negative levels - show highlight immediately
  if (level < 0) {
    countryToHighlight.value = props.targetCountryToClick
    highlightColor.value = '#3b82f6'
    useCircleAroundHighlight.value = true
  } else {
    countryToHighlight.value = undefined
    useCircleAroundHighlight.value = false
  }

  // Set zoom level based on level linear
  zoomLevel.value = level > 0 
    ? 100 + 5 * level
    : 100
  
  feedbackMessage.value = `Find ${props.targetCountryToClick} on the map`
  
  // Start tracking time for this exercise
  exerciseStartTime.value = Date.now()
  firstClickTime.value = null
  firstClickDistance.value = null
}

const handleMapClicked = async (touchedCountries: string[], distanceToTarget?: number) => {
  attempts.value++
  
  // Track first click timing and distance
  if (attempts.value === 1) {
    firstClickTime.value = Date.now()
    firstClickDistance.value = distanceToTarget || 0
  }
  
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
    
    // Save learning event
    await saveLearningEvent({
      timestamp: new Date(),
      country: props.targetCountryToClick,
      msFromExerciseToFirstClick: (firstClickTime.value || 0) - exerciseStartTime.value,
      msFromExerciseToFinishClick: Date.now() - exerciseStartTime.value,
      numberOfClicksNeeded: attempts.value,
      distanceOfFirstClickToCenterOfCountry: firstClickDistance.value || 0
    })
    
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
  highlightColor.value = '#3b82f6'
  initializeCountryLevel()
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col">
    <!-- Game Messages -->
      <div class="text-lg font-semibold text-center">
        {{ feedbackMessage }}
      </div>

    <!-- Map Container -->
    <div class="w-full h-[80vh] bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <WorldMap
        :country-to-highlight="countryToHighlight"
        :highlight-color="highlightColor"
        :use-circle-around-highlight="useCircleAroundHighlight"
        :zoom-level="zoomLevel"
        :target-country="targetCountryToClick"
        @map-clicked="handleMapClicked"
      />
    </div>
  </div>
</template> 