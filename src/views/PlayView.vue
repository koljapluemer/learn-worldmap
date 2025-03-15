<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorldMapGame from '../components/WorldMapGame.vue'
import { db } from '../db/database'
import type { CountryCard } from '../db/database'
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'
import { availableCountries, loadMapData } from '../services/mapData'

// Game state
const currentCountry = ref<string | null>(null)

const selectRandomCountry = () => {
  const randomIndex = Math.floor(Math.random() * availableCountries.value.length)
  currentCountry.value = availableCountries.value[randomIndex]
}

const handleGameComplete = async ({ country, attempts }: { country: string, attempts: number }) => {
  // Determine rating based on attempts
  let rating: Rating
  switch (attempts) {
    case 1:
      rating = Rating.Good
      break
    case 2:
      rating = Rating.Hard
      break
    default:
      rating = Rating.Again
  }

  // Update spaced repetition data
  let card = await db.countryCards.get(country)
  const f = fsrs()
  
  if (!card) {
    const emptyCard = createEmptyCard()
    card = { ...emptyCard, countryName: country } as CountryCard
  }

  const result = f.next(card, new Date(), rating)
  await db.countryCards.put({ ...result.card, countryName: country })

  // Select next country after a delay
  setTimeout(selectRandomCountry, 2000)
}

// Load map data and initialize game
onMounted(async () => {
  await loadMapData()
  selectRandomCountry()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Game Component -->
    <WorldMapGame
      v-if="currentCountry"
      :target-country-to-click="currentCountry"
      @game-complete="handleGameComplete"
    />
  </div>
</template> 