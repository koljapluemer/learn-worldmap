<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorldMapGame from '../components/WorldMapGame.vue'
import ChallengeRulesPopup from '../components/ChallengeRulesPopup.vue'
import ChallengeResults from '../components/ChallengeResults.vue'
import ChallengeCompletedCard from '../components/ChallengeCompletedCard.vue'
import { useDailyChallenge } from '../composables/useDailyChallenge'

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
  console.log('endChallenge - Before:', {
    resultsLength: results.value.length,
    state: state.value
  })
  
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(`challenge_completed_${today}`, 'true')
  state.value = ChallengeState.COMPLETED
  
  console.log('endChallenge - After:', {
    resultsLength: results.value.length,
    state: state.value
  })
}

onMounted(() => {
  console.log('ChallengeView mounted:', {
    hasCompletedToday: hasCompletedToday(),
    state: state.value,
    resultsLength: results.value.length
  })
  
  if (hasCompletedToday()) {
    state.value = ChallengeState.COMPLETED
    console.log('Challenge already completed:', {
      state: state.value,
      resultsLength: results.value.length
    })
  } else {
    showRules()
  }
})

const handleStart = () => {
  console.log('handleStart - Before:', {
    state: state.value,
    resultsLength: results.value.length
  })
  
  startChallenge()
  countryStartTime.value = Date.now()
  
  console.log('handleStart - After:', {
    state: state.value,
    resultsLength: results.value.length
  })
}

const handleGameComplete = (result: { country: string, attempts: number }) => {
  console.log('handleGameComplete - Before:', {
    currentCountryIndex: currentCountryIndex.value,
    resultsLength: results.value.length,
    state: state.value
  })
  
  if (!countryStartTime.value) return
  
  const timeMs = Date.now() - countryStartTime.value
  handleCountryCompletion(result.attempts === 1, timeMs)
  
  // If this was the last country, end the challenge
  if (currentCountryIndex.value === 9) {
    endChallenge()
  } else {
    countryStartTime.value = Date.now()
  }
  
  console.log('handleGameComplete - After:', {
    currentCountryIndex: currentCountryIndex.value,
    resultsLength: results.value.length,
    state: state.value
  })
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
      @share="(platform) => console.log('Shared on:', platform)"
    />

    <!-- Already Completed Card -->
    <ChallengeCompletedCard
      v-if="state === ChallengeState.COMPLETED && results.length === 0"
    />
  </div>
</template> 