<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorldMapGame from '@/modules/map-renderer/WorldMapGame.vue'
import { useLessonLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useLessonLearning'
import { LessonManager } from '@/lessons/LessonManager'
import type { Exercise } from '@/lessons/types'
import { getCurrentSeed } from '@/modules/randomness/random'

const lessonManager = LessonManager.getInstance()
const currentLessonId = ref<string | null>(null)
const currentExercise = ref<Exercise | null>(null)
const isLoading = ref(true)

const { setLessons, handleExerciseCompletion, selectNextLesson, selectNextExercise } = useLessonLearning()

onMounted(async () => {
  try {
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
  if (currentLessonId.value && currentExercise.value) {
    await handleExerciseCompletion(currentLessonId.value, currentExercise.value, result.attempts)
    // Select next lesson and exercise
    currentLessonId.value = await selectNextLesson()
    if (currentLessonId.value) {
      currentExercise.value = await selectNextExercise(currentLessonId.value)
    }
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Game Component -->
    <WorldMapGame
      v-if="currentExercise"
      :target-country-to-click="currentExercise.data.country"
      :zoom-level="currentExercise.data.zoom"
      :pan-field="currentExercise.data.panField as number | undefined"
      :exercise-id="currentExercise.id"
      @game-complete="handleGameComplete"
      :allow-more-than-one-attempt="true"
    >
      <template #instruction>
        {{ currentExercise.instruction }}
      </template>
    </WorldMapGame>

  </div>
</template>
