<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import WorldMap from './WorldMap.vue'

const props = defineProps<{
  targetCountryToClick: string
  zoomLevel?: number
  allowMoreThanOneAttempt: boolean
  panIndex?: number
  exerciseId: string
}>()

const emit = defineEmits<{
  gameComplete: [{
    timestamp: Date,
    exerciseId: string,
    msFromExerciseToFirstClick: number,
    msFromExerciseToFinishClick: number,
    numberOfClicksNeeded: number,
    distanceOfFirstClickToCenterOfCountry: number
  }]
}>()

// Game state
const attempts = ref(0)
const countryToHighlight = ref<string | undefined>(undefined)
const highlightColor = ref<string>('#3b82f6')
const useCircleAroundHighlight = ref(false)
const isLoading = ref(false)
const isMapReady = ref(false)

// Learning event tracking
const exerciseStartTime = ref<number>(0)
const firstClickTime = ref<number | null>(null)
const firstClickDistance = ref<number | null>(null)

const handleCorrectCountryFound = async () => {
  countryToHighlight.value = props.targetCountryToClick
  highlightColor.value = '#22c55e'
  useCircleAroundHighlight.value = true
  isLoading.value = true

  const now = Date.now()
  emit('gameComplete', {
    timestamp: new Date(),
    exerciseId: props.exerciseId,
    msFromExerciseToFirstClick: firstClickTime.value ? firstClickTime.value - exerciseStartTime.value : 0,
    msFromExerciseToFinishClick: now - exerciseStartTime.value,
    numberOfClicksNeeded: attempts.value,
    distanceOfFirstClickToCenterOfCountry: firstClickDistance.value ?? 0
  })
}

const handleMapClicked = async (_touchedCountries: string[], distanceToTarget?: number) => {
  if (isLoading.value) return

  attempts.value++

  if (attempts.value === 1) {
    firstClickTime.value = Date.now()
    firstClickDistance.value = distanceToTarget || 0
  }

  if (props.allowMoreThanOneAttempt) {
    if (_touchedCountries.includes(props.targetCountryToClick)) {
      handleCorrectCountryFound()
    } else {
      if (attempts.value === 1) {
        countryToHighlight.value = props.targetCountryToClick
        highlightColor.value = '#3b82f6'
        useCircleAroundHighlight.value = true
      } else {
        countryToHighlight.value = undefined
        useCircleAroundHighlight.value = false
      }
    }
  } else {
    if (_touchedCountries.includes(props.targetCountryToClick)) {
      handleCorrectCountryFound()
    } else {
      countryToHighlight.value = props.targetCountryToClick
      highlightColor.value = '#eb4034'
      useCircleAroundHighlight.value = true
      // Also emit a learning event for a failed attempt (if needed)
      const now = Date.now()
      emit('gameComplete', {
        timestamp: new Date(),
        exerciseId: props.exerciseId,
        msFromExerciseToFirstClick: firstClickTime.value ? firstClickTime.value - exerciseStartTime.value : 0,
        msFromExerciseToFinishClick: now - exerciseStartTime.value,
        numberOfClicksNeeded: attempts.value,
        distanceOfFirstClickToCenterOfCountry: firstClickDistance.value ?? 0
      })
    }
  }
}

const handleMapReady = () => {
  isMapReady.value = true
}

watch([() => props.targetCountryToClick, () => props.exerciseId], () => {
  attempts.value = 0
  highlightColor.value = '#3b82f6'
  isLoading.value = false
  countryToHighlight.value = undefined
  useCircleAroundHighlight.value = false
  exerciseStartTime.value = Date.now()
  firstClickTime.value = null
  firstClickDistance.value = null
}, { immediate: true })

watch([() => props.targetCountryToClick, () => props.exerciseId], (newValues) => {
  if (newValues[0]) {
    document.body.classList.add('hovering-map')
  } else {
    document.body.classList.remove('hovering-map')
  }
}, { immediate: true })

onUnmounted(() => {
  document.body.classList.remove('hovering-map')
})
</script>

<template>
  <div class="flex flex-col justify-center items-center relative">
    <div class="w-full h-[80vh] bg-base-100 rounded-lg shadow-lg overflow-hidden card card-border">
      <WorldMap 
        :country-to-highlight="countryToHighlight" 
        :highlight-color="highlightColor"
        :use-circle-around-highlight="useCircleAroundHighlight" 
        :zoom-level="props.zoomLevel"
        :target-country="targetCountryToClick" 
        :pan-index="panIndex"
        @map-clicked="handleMapClicked" 
        @map-ready="handleMapReady"
        :is-interactive="true" 
      />
    </div>
  </div>
</template>