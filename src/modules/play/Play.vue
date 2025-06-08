<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'
import { Lesson } from '@/lessons/Lesson'
import type { Exercise } from '@/lessons/types'
import { loadLessons } from '@/lessons/loadLessons'
import WorldMapGame from '@/modules/map-renderer/WorldMapGame.vue'
import { useCountrySelection } from '@/modules/filter-view/selections/useCountrySelection'
import { useGeographyLearning } from '@/modules/spaced-repetition-learning/calculate-learning/useGeographyLearning'

// Get country selection from composable
const { selectedCountries } = useCountrySelection()
const lessons = ref<Lesson[]>([])

// Initialize learning system
const { targetExercise, message, setAvailableExercises, selectRandomExercise, handleExerciseCompletion } = useGeographyLearning()

// Load lessons on mount
onMounted(async () => {
  lessons.value = await loadLessons()
  
  // Get all exercises from all lessons
  const allExercises: Exercise[] = []
  lessons.value.forEach(lesson => {
    lesson.templates.forEach(template => {
      // Generate all possible exercises from this template
      const exercises = template.generateExercises(Math.random())
      allExercises.push(...exercises)
    })
  })
  
  // Set available exercises in learning system
  await setAvailableExercises(allExercises)
  
  // Select first exercise
  await selectRandomExercise()
})

const handleGameComplete = async (result: { country: string, attempts: number }) => {
  if (targetExercise.value) {
    await handleExerciseCompletion(targetExercise.value.id, result.attempts)
  }
}

const targetCountry = computed(() => {
  if (!targetExercise.value?.data?.country) return ''
  return targetExercise.value.data.country as string
})

// Add debug logging after all properties are defined
console.log('Debug - selectedCountries:', selectedCountries.value)
console.log('Debug - currentExercise:', targetExercise.value)
console.log('Debug - targetCountry:', targetCountry.value)
</script>

<template>
  <main>
    <!-- Game Component -->
    <WorldMapGame
      v-if="targetExercise && selectedCountries.length > 0 && targetCountry"
      :target-country-to-click="targetCountry"
      :zoom-level="targetExercise.data.zoom as number"
      :pan-field="targetExercise.data.panField as number | undefined"
      :exercise-id="targetExercise.id"
      @game-complete="handleGameComplete"
      :allow-more-than-one-attempt="true"
    >
      <template #instruction>
        {{ message }}
      </template>
    </WorldMapGame>

    <!-- show simple! warning if no countries are selected -->
    <div v-if="selectedCountries.length === 0" class="p-4 w-full">
      <div class="alert alert-warning">
        <div class="flex-1">
          Please select at least one country
        </div>
      </div>
    </div>
  </main>
</template>
