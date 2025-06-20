<script setup lang="ts">
import { computed } from 'vue'
import { useLearningGoalProgressStore } from './learningGoalProgressStore'

const store = useLearningGoalProgressStore()

const sortedProgress = computed(() =>
  Object.values(store.progress)
    .sort((a, b) => {
      const aTime = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0
      const bTime = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 100)
)
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Last 100 Learning Goal Progress Entries</h1>
    <div v-if="!sortedProgress.length" class="text-gray-500">No progress recorded yet.</div>
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra w-full text-xs">
        <thead>
          <tr>
            <th>Learning Goal</th>
            <th>Last Seen</th>
            <th>Due Date</th>
            <th>Stability</th>
            <th>Difficulty</th>
            <th>Elapsed Days</th>
            <th>Scheduled Days</th>
            <th>Reps</th>
            <th>Lapses</th>
            <th>State</th>
            <th>Last Review</th>
            <th>Streak</th>
            <th>Last Correct</th>
            <th>Correct Count</th>
            <th>Blacklisted</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, idx) in sortedProgress" :key="entry.learningGoalName">
            <td>{{ entry.learningGoalName }}</td>
            <td>{{ entry.lastSeenAt ? new Date(entry.lastSeenAt).toLocaleString() : '' }}</td>
            <td>{{ new Date(entry.due).toLocaleString() }}</td>
            <td>{{ entry.stability?.toFixed(2) || '-' }}</td>
            <td>{{ entry.difficulty?.toFixed(2) || '-' }}</td>
            <td>{{ entry.elapsed_days || '-' }}</td>
            <td>{{ entry.scheduled_days || '-' }}</td>
            <td>{{ entry.reps || '-' }}</td>
            <td>{{ entry.lapses || '-' }}</td>
            <td>{{ entry.state || '-' }}</td>
            <td>{{ entry.last_review ? new Date(entry.last_review).toLocaleString() : '-' }}</td>
            <td>{{ entry.streak || 0 }}</td>
            <td>
              <span v-if="entry.lastRepetitionCorrect === true" class="text-success">✓</span>
              <span v-else-if="entry.lastRepetitionCorrect === false" class="text-error">✗</span>
              <span v-else>-</span>
            </td>
            <td>{{ entry.correctRepetitionCount || 0 }}</td>
            <td>
              <span v-if="entry.isBlacklisted" class="text-error">Yes</span>
              <span v-else class="text-success">No</span>
            </td>
            <td>{{ entry.priority || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
