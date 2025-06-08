<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'
import WorldMap from './WorldMap.vue'
import { useDexie } from '@/modules/spaced-repetition-learning/calculate-learning/useDexie'

const props = defineProps<{
  targetCountryToClick: string
  zoomLevel?: number
  allowMoreThanOneAttempt: boolean
  panField?: number
  exerciseId: string
}>()

const emit = defineEmits<{
  (e: 'gameComplete', result: { country: string, attempts: number }): void
}>()

// Game state
const attempts = ref(0)
const countryToHighlight = ref<string | undefined>(undefined)
const highlightColor = ref<string>('#3b82f6')
const useCircleAroundHighlight = ref(false)
const zoomLevel = ref(100)
const isLoading = ref(false)
const { saveLearningEvent } = useDexie()
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

  await saveLearningEvent({
    timestamp: new Date(),
    exerciseId: props.exerciseId,
    msFromExerciseToFirstClick: (firstClickTime.value || 0) - exerciseStartTime.value,
    msFromExerciseToFinishClick: Date.now() - exerciseStartTime.value,
    numberOfClicksNeeded: attempts.value,
    distanceOfFirstClickToCenterOfCountry: firstClickDistance.value || 0
  })

  emit('gameComplete', {
    country: props.targetCountryToClick,
    attempts: attempts.value
  })
}

const handleMapClicked = async (touchedCountries: string[], distanceToTarget?: number) => {
  if (isLoading.value) return

  attempts.value++

  if (attempts.value === 1) {
    firstClickTime.value = Date.now()
    firstClickDistance.value = distanceToTarget || 0
  }

  if (props.allowMoreThanOneAttempt) {
    if (touchedCountries.includes(props.targetCountryToClick)) {
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
    if (touchedCountries.includes(props.targetCountryToClick)) {
      handleCorrectCountryFound()
    } else {
      countryToHighlight.value = props.targetCountryToClick
      highlightColor.value = '#eb4034'
      useCircleAroundHighlight.value = true
      emit('gameComplete', {
        country: props.targetCountryToClick,
        attempts: attempts.value
      })
    }
  }
}

const handleMapReady = () => {
  isMapReady.value = true
  if (props.targetCountryToClick) {
    countryToHighlight.value = undefined
    nextTick(() => {
      countryToHighlight.value = props.targetCountryToClick
    })
  }
}

watch(() => props.targetCountryToClick, () => {
  attempts.value = 0
  highlightColor.value = '#3b82f6'
  isLoading.value = false
  countryToHighlight.value = undefined
  useCircleAroundHighlight.value = false
  exerciseStartTime.value = Date.now()
  firstClickTime.value = null
  firstClickDistance.value = null
}, { immediate: true })

watch(() => props.targetCountryToClick, (newValue) => {
  if (newValue) {
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
        :zoom-level="zoomLevel"
        :target-country="targetCountryToClick" 
        @map-clicked="handleMapClicked" 
        @map-ready="handleMapReady"
        :is-interactive="true" 
      />
    </div>
  </div>
</template>