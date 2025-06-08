<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import WorldMapGame from '@/modules/map-renderer/WorldMapGame.vue'
import { useLessonLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useLessonLearning'
import { LessonManager } from '@/lessons/LessonManager'
import type { Exercise } from '@/lessons/types'
import ExerciseInstruction from './ExerciseInstruction.vue'

const lessonManager = LessonManager.getInstance()
const currentLessonId = ref<string | null>(null)
const currentExercise = ref<Exercise | null>(null)
const isLoading = ref(true)
const attempts = ref(0)
const isSuccess = ref(false)

const { setLessons, handleExerciseCompletion, selectNextLesson, selectNextExercise } = useLessonLearning()

const instruction = computed(() => {
  if (!currentExercise.value) return ''
  return currentExercise.value.instruction
})

// Detect touch device properly
onMounted(async () => {
  try {
    // Check for touch capability

    await lessonManager.loadLessons()
    setLessons(lessonManager.getAllLessonIds())
    currentLessonId.value = await selectNextLesson()
    if (currentLessonId.value) {
      currentExercise.value = await selectNextExercise(currentLessonId.value)
    }
    isLoading.value = false
  } catch (error) {
    console.error('Failed to load lessons:', error)
    isLoading.value = false
  }
})

const handleGameComplete = async (result: { country: string, attempts: number }) => {
  attempts.value = result.attempts
  isSuccess.value = true
  
  // Wait a bit before loading next exercise
  setTimeout(async () => {
    if (currentLessonId.value && currentExercise.value) {
      await handleExerciseCompletion(currentLessonId.value, currentExercise.value, result.attempts)
      currentLessonId.value = await selectNextLesson()
      if (currentLessonId.value) {
        currentExercise.value = await selectNextExercise(currentLessonId.value)
        isSuccess.value = false
      }
    }
  }, 1000)
}
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Game Component -->
    <div v-else class="relative">
      <Transition name="flip" mode="out-in">
        <div v-if="currentExercise" :key="currentExercise.id" 
          class="card card-border p-2 m-2 absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-base-100/95 backdrop-blur-sm shadow-sm inline-block w-full max-w-4/5 text-center"
          :class="{ 'bg-success/95': isSuccess }"
        >
          <ExerciseInstruction :instruction="instruction" />
        </div>
      </Transition>

      <WorldMapGame
        v-if="currentExercise"
        :target-country-to-click="currentExercise.data.country"
        :zoom-level="currentExercise.data.zoom"
        :pan-field="currentExercise.data.panField as number | undefined"
        :exercise-id="currentExercise.id"
        @game-complete="handleGameComplete"
        :allow-more-than-one-attempt="true"
      />
    </div>
  </div>
</template>

<style scoped>
.flip-enter-active,
.flip-leave-active {
  transition: all 0.2s ease;
}

.flip-enter-from,
.flip-leave-to {
  opacity: 0;
  transform: perspective(400px) rotateX(90deg);
}

.flip-enter-to,
.flip-leave-from {
  opacity: 1;
  transform: perspective(400px) rotateX(0);
}
</style>
