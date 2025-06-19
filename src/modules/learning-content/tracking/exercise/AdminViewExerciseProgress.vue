<script setup lang="ts">
import { computed } from 'vue'
import { useExerciseProgressStore } from './exerciseProgressStore'

const store = useExerciseProgressStore()
const allProgress = computed(() => Object.values(store.progress))
const sortedProgress = computed(() =>
  [...allProgress.value]
    .sort((a, b) => {
      // Prefer last_review, fallback to due
      const aTime = a.last_review ? new Date(a.last_review).getTime() : new Date(a.due).getTime()
      const bTime = b.last_review ? new Date(b.last_review).getTime() : new Date(b.due).getTime()
      return bTime - aTime
    })
    .slice(0, 100)
)
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Last 100 Exercise Progress Entries</h1>
    <div v-if="!sortedProgress.length" class="text-gray-500">No progress recorded yet.</div>
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra w-full text-xs">
        <thead>
          <tr>
            <th>Exercise ID</th>
            <th>Streak</th>
            <th>Due</th>
            <th>Stability</th>
            <th>Difficulty</th>
            <th>Reps</th>
            <th>Lapses</th>
            <th>State</th>
            <th>Last Review</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, idx) in sortedProgress" :key="entry.exerciseId">
            <td>{{ entry.exerciseId }}</td>
            <td>{{ entry.streak }}</td>
            <td>{{ entry.due ? new Date(entry.due).toLocaleString() : '' }}</td>
            <td>{{ entry.stability }}</td>
            <td>{{ entry.difficulty }}</td>
            <td>{{ entry.reps }}</td>
            <td>{{ entry.lapses }}</td>
            <td>{{ entry.state }}</td>
            <td>{{ entry.last_review ? new Date(entry.last_review).toLocaleString() : '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
