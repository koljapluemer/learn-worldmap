<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadLessons } from '@/lessons/loadLessons'
import WorldMapGame from '@/modules/map-renderer/WorldMapGame.vue'
import { useLessonLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useLessonLearning'
import type { Lesson } from '@/lessons/Lesson'
import type { Exercise } from '@/lessons/types'
import { getCurrentSeed } from '@/modules/randomness/random'

const lessons = ref<Lesson[]>([])
const currentLesson = ref<Lesson | null>(null)
const currentExercise = ref<Exercise | null>(null)
const isLoading = ref(true)

const { setLessons, handleExerciseCompletion } = useLessonLearning()

onMounted(async () => {
  try {
    lessons.value = await loadLessons()
    setLessons(lessons.value)
    currentLesson.value = lessons.value[0]
    if (currentLesson.value) {
      const seed = getCurrentSeed()
      currentExercise.value = currentLesson.value.templates[0].pickRandomExercise(seed)
    }
    isLoading.value = false
  } catch (error) {
    console.error('Failed to load lessons:', error)
    isLoading.value = false
  }
})

const handleGameComplete = async (result: { country: string, attempts: number }) => {
  if (currentLesson.value) {
    await handleExerciseCompletion(currentLesson.value.name, result.attempts)
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

    <!-- show simple! warning if no lessons are loaded -->
    <div v-if="lessons.length === 0" class="p-4 w-full">
      <div class="alert alert-warning">
        <div class="flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 mx-2 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <label>No lessons loaded!</label>
        </div>
      </div>
    </div>
  </div>
</template>
