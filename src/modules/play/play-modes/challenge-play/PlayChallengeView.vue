<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDailyChallenge } from './useDailyChallenge'
import WorldMapGame from '../../map-renderer/WorldMapGame.vue'
import ChallengeResults from './ChallengeResults.vue'
import ChallengeRulesPopup from './ChallengeRulesPopup.vue'
import ChallengeCompletedCard from './ChallengeCompletedCard.vue'


const {
  state,
  currentCountryIndex,
  results,
  currentScore,
  totalTimeMs,
  dailyChallenge,
  hasCompletedToday,
  startChallenge,
  showRules,
  handleCountryCompletion,
  ChallengeState
} = useDailyChallenge()

const countryStartTime = ref<number | null>(null)

// End the challenge and save completion status
const endChallenge = () => {

  
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(`challenge_completed_${today}`, 'true')
  state.value = ChallengeState.COMPLETED
  
}

onMounted(() => {

  if (hasCompletedToday()) {
    state.value = ChallengeState.COMPLETED

  } else {
    showRules()
  }
})

const handleStart = () => {

  startChallenge()
  countryStartTime.value = Date.now()

}

const handleGameComplete = (result: { country: string, attempts: number }) => {

  
  if (!countryStartTime.value) return
  
  const timeMs = Date.now() - countryStartTime.value
  handleCountryCompletion(result.attempts === 1, timeMs)
  
  // If this was the last country, end the challenge
  if (currentCountryIndex.value === 9) {
    endChallenge()
  } else {
    countryStartTime.value = Date.now()
  }
  

}
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <!-- Header with Score -->
    <header class="bg-base-100 shadow-sm p-1">
      <div class="flex items-center justify-between">
        <h1 class="text-xs md:text-base font-medium">Daily Challenge</h1>
        <div class="flex items-center gap-2">
          <div class="text-sm">
            Score: <span class="font-bold">{{ currentScore }}</span>
          </div>
          <div class="text-sm">
            {{ currentCountryIndex + 1 }}/10
          </div>
        </div>
      </div>
    </header>

    <!-- Progress Bar -->
    <div class="h-1 bg-base-200">
      <div class="flex h-full">
        <div 
          v-for="(result, index) in results" 
          :key="index"
          class="flex-1 transition-all duration-300"
          :class="{
            'bg-success': result.correct,
            'bg-error': !result.correct
          }"
        ></div>
        <div 
          v-for="i in 10 - results.length" 
          :key="'pending-' + i"
          class="flex-1 bg-base-300 transition-all duration-300"
        ></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative">
      <WorldMapGame
        v-if="state === ChallengeState.IN_PROGRESS && dailyChallenge[currentCountryIndex]"
        :target-country-to-click="dailyChallenge[currentCountryIndex].country"
        :zoom-level="dailyChallenge[currentCountryIndex].zoomLevel"
        @game-complete="handleGameComplete"
      />
    </div>

    <!-- Rules Popup -->
    <ChallengeRulesPopup
      v-if="state === ChallengeState.RULES_SHOWN"
      @close="showRules"
      @start="handleStart"
    />

    <!-- Results Popup -->
    <ChallengeResults
      v-if="state === ChallengeState.COMPLETED && results.length > 0"
      :results="results"
      :total-score="currentScore"
      :total-time-ms="totalTimeMs"
      :average-time-ms="Math.round(totalTimeMs / 10)"
      @share="(platform: string) => console.log('Shared on:', platform)"
    />

    <!-- Already Completed Card -->
    <ChallengeCompletedCard
      v-if="state === ChallengeState.COMPLETED && results.length === 0"
    />
  </div>
</template> 