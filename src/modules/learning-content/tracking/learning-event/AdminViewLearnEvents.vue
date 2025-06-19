<script setup lang="ts">
import { computed } from 'vue'
import { useLearningEventStore } from './learningEventStore'

const store = useLearningEventStore()
const last100Events = computed(() =>
  [...store.events].slice(-100).reverse()
)
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Last 100 Learning Events</h1>
    <div v-if="!last100Events.length" class="text-gray-500">No events recorded yet.</div>
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra w-full text-xs">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Exercise ID</th>
            <th>ms to 1st Click</th>
            <th>ms to Finish</th>
            <th># Clicks</th>
            <th>Dist. 1st Click</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(event, idx) in last100Events" :key="idx">
            <td>{{ new Date(event.timestamp).toLocaleString() }}</td>
            <td>{{ event.exerciseId }}</td>
            <td>{{ event.msFromExerciseToFirstClick }}</td>
            <td>{{ event.msFromExerciseToFinishClick }}</td>
            <td>{{ event.numberOfClicksNeeded }}</td>
            <td>{{ event.distanceOfFirstClickToCenterOfCountry.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
