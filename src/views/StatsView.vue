<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Learning Progress View</h1>
    
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Country</th>
            <th>Due Date</th>
            <th>Stability</th>
            <th>Difficulty</th>
            <th>Reps</th>
            <th>Lapses</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="card in cards" :key="card.countryName">
            <td>{{ card.countryName }}</td>
            <td>{{ formatDate(card.due) }}</td>
            <td>{{ card.stability.toFixed(2) }}</td>
            <td>{{ card.difficulty.toFixed(2) }}</td>
            <td>{{ card.reps }}</td>
            <td>{{ card.lapses }}</td>
            <td>{{ card.state }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db, CountryCard } from '../db/database'

const cards = ref<CountryCard[]>([])

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  cards.value = await db.countryCards.toArray()
})
</script> 