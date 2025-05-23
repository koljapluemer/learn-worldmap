<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold">Learning Progress for {{ country }}</h1>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <TimeProgressChart 
        :learning-events="learningEvents" 
        class="card bg-base-100 shadow-xl p-4"
      />
      
      <DistanceProgressChart
        :learning-events="learningEvents"
        class="card bg-base-100 shadow-xl p-4"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TimeProgressChart from './TimeProgressChart.vue';
import DistanceProgressChart from './DistanceProgressChart.vue';
import { useDexie } from '@/modules/spaced-repetition-learning/calculate-learning/useDexie';
import type { LearningEvent } from '@/modules/shared-types/types';

const props = defineProps<{
  country: string
}>()

const learningEvents = ref<LearningEvent[]>([])

onMounted(async () => {
  const db = useDexie()
  // Get all learning events for this country, sorted by timestamp
  const events = await db.getLearningEventsForCountry(props.country)
  learningEvents.value = events.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
})
</script> 