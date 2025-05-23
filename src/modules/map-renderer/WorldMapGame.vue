<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import WorldMap from './WorldMap.vue'
import { useDexie } from '@/modules/spaced-repetition-learning/calculate-learning/useDexie'

const props = defineProps<{
  targetCountryToClick: string
  zoomLevel?: number
  allowMoreThanOneAttempt: boolean
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
const { getCard, saveLearningEvent } = useDexie()
const isTouchDevice = ref('ontouchstart' in window)

// Learning event tracking
const exerciseStartTime = ref<number>(0)
const firstClickTime = ref<number | null>(null)
const firstClickDistance = ref<number | null>(null)
const dynamicMessage = ref<string | null>(null)

const feedbackMessage = computed(() => {
  if (dynamicMessage.value) return dynamicMessage.value

  const countryName = `<strong>${props.targetCountryToClick}</strong>`
  return isTouchDevice.value
    ? `Drag the red circle onto ${countryName}`
    : `Place the red circle so that it touches ${countryName}`
})

// Initialize level-based settings when target country changes
const initializeCountryLevel = async () => {
  if (!props.targetCountryToClick) return

  if (props.zoomLevel !== undefined) {
    zoomLevel.value = props.zoomLevel
    if (props.zoomLevel < 100) {
      countryToHighlight.value = props.targetCountryToClick
      highlightColor.value = '#3b82f6'
      useCircleAroundHighlight.value = true
    } else {
      countryToHighlight.value = undefined
      useCircleAroundHighlight.value = false
    }
  } else {
    const card = await getCard(props.targetCountryToClick)
    const level = card?.level || 0

    if (level < 0) {
      countryToHighlight.value = props.targetCountryToClick
      highlightColor.value = '#3b82f6'
      useCircleAroundHighlight.value = true
    } else {
      countryToHighlight.value = undefined
      useCircleAroundHighlight.value = false
    }

    zoomLevel.value = level > 0
      ? 100 + 5 * level
      : 100
  }

  dynamicMessage.value = null
  exerciseStartTime.value = Date.now()
  firstClickTime.value = null
  firstClickDistance.value = null
}

const handleCorrectCountryFound = async () => {
  countryToHighlight.value = props.targetCountryToClick
  highlightColor.value = '#22c55e'
  useCircleAroundHighlight.value = true
  isLoading.value = true

  if (attempts.value === 1) {
    dynamicMessage.value = `That's <strong>${props.targetCountryToClick}</strong>. First try!`
  } else {
    dynamicMessage.value = `You found <strong>${props.targetCountryToClick}</strong> after ${attempts.value} tries.`
  }
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
      dynamicMessage.value = `<strong>${props.targetCountryToClick}</strong> is here, try again.`
      if (attempts.value === 1) {
        countryToHighlight.value = props.targetCountryToClick
        highlightColor.value = '#3b82f6'
        useCircleAroundHighlight.value = true
      }
    }
  } else {
    if (touchedCountries.includes(props.targetCountryToClick)) {
      handleCorrectCountryFound()
      setTimeout(() => {
        emit('gameComplete', {
          country: props.targetCountryToClick,
          attempts: attempts.value
        })
      }, 500)
    } else {
      dynamicMessage.value = `<strong>${props.targetCountryToClick}</strong> is here, try again.`
      countryToHighlight.value = props.targetCountryToClick
      highlightColor.value = '#eb4034'
      useCircleAroundHighlight.value = true

      setTimeout(() => {
        emit('gameComplete', {
          country: props.targetCountryToClick,
          attempts: attempts.value
        })
      }, 500)
    }
  }
}

watch(() => props.targetCountryToClick, () => {
  attempts.value = 0
  highlightColor.value = '#3b82f6'
  isLoading.value = false
  initializeCountryLevel()
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
    <!-- Map Container -->
    <div class="w-full h-[80vh] bg-base-100 rounded-lg shadow-lg overflow-hidden card card-border">
      <WorldMap :country-to-highlight="countryToHighlight" :highlight-color="highlightColor"
        :use-circle-around-highlight="useCircleAroundHighlight" :zoom-level="zoomLevel"
        :target-country="targetCountryToClick" @map-clicked="handleMapClicked" />
    </div>

    <!-- Game Messages -->
    <div class="card card-border p-2 m-2 absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-base-100/95 backdrop-blur-sm shadow-sm inline-block w-full max-w-4/5 text-center" v-html="feedbackMessage">
    </div>
  </div>
</template>