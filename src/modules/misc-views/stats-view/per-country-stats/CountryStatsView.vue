<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center gap-4 mb-6">
      <router-link 
        :to="{ name: 'stats' }" 
        class="btn btn-ghost"
      >
        ← Back to Stats
      </router-link>
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
import { useDexie, type LearningEvent } from '../composables/useDexie'
import TimeProgressChart from '../components/stats/TimeProgressChart.vue'
import DistanceProgressChart from '../components/stats/DistanceProgressChart.vue'

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