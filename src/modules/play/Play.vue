<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'
import { Lesson } from '@/lessons/Lesson'
import type { Exercise } from '@/lessons/types'
import { loadLessons } from '@/lessons/loadLessons'
import WorldMapGame from '@/modules/map-renderer/WorldMapGame.vue'
import { useCountrySelection } from '@/modules/filter-view/selections/useCountrySelection'

// Get country selection from composable
const { selectedCountries } = useCountrySelection()
const currentExercise = ref<Exercise | null>(null)
const lessons = ref<Lesson[]>([])

// Load lessons on mount
onMounted(async () => {
  lessons.value = await loadLessons()
  selectRandomExercise()
})

const selectRandomExercise = () => {
  if (lessons.value.length === 0) return

  // Select random lesson
  const randomLessonIndex = Math.floor(Math.random() * lessons.value.length)
  const lesson = lessons.value[randomLessonIndex]

  // Select random exercise from the lesson
  const randomTemplateIndex = Math.floor(Math.random() * lesson.templates.length)
  const template = lesson.templates[randomTemplateIndex]
  
  // Generate exercise with random seed
  currentExercise.value = template.pickRandomExercise(Math.random())
}

const handleGameComplete = () => {
  selectRandomExercise()
}

const targetCountry = computed(() => {
  if (!currentExercise.value?.data?.country) return ''
  return currentExercise.value.data.country as string
})

// Add debug logging after all properties are defined
console.log('Debug - selectedCountries:', selectedCountries.value)
console.log('Debug - currentExercise:', currentExercise.value)
console.log('Debug - targetCountry:', targetCountry.value)

</script>

<template>
  <main>
    <!-- Game Component -->
    <WorldMapGame
      v-if="currentExercise && selectedCountries.length > 0 && targetCountry"
      :target-country-to-click="targetCountry"
      :zoom-level="currentExercise.data.zoom as number"
      :pan-field="currentExercise.data.panField as number | undefined"
      @game-complete="handleGameComplete"
      :allow-more-than-one-attempt="true"
    >
      <template #instruction>
        {{ currentExercise.instruction }}
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
