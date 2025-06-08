<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Learning Progress</h1>
    
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Exercise ID</th>
            <th>Due Date</th>
            <th>Stability</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="card in cards" 
            :key="card.exerciseId"
            class="hover:bg-base-200 cursor-pointer"
          >
            <td class="text-primary hover:underline">{{ card.exerciseId }}</td>
            <td>{{ formatDate(card.due) }}</td>
            <td>{{ card.stability.toFixed(2) }}</td>
            <td>{{ card.difficulty.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExerciseCard } from '@/modules/shared-types/types'
import { useDexie } from '@/modules/spaced-repetition-learning/calculate-learning/useDexie'
import { ref, onMounted } from 'vue'

const { getAllCards } = useDexie()
const cards = ref<ExerciseCard[]>([])

const formatDate = (date: Date) => {
  // show human readable date and time  
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
}

onMounted(async () => {
  cards.value = await getAllCards()
})
</script> 