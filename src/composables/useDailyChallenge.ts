import { ref, computed } from 'vue'
import { availableCountries } from '../services/mapData'
import { seededRandom, getDailySeed, seededRandomInt } from '../utils/random'

enum ChallengeState {
  NOT_STARTED = 'NOT_STARTED',
  RULES_SHOWN = 'RULES_SHOWN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

interface ChallengeResult {
  country: string
  correct: boolean
  timeMs: number
  zoomLevel: number
}

// Calculate score based on time
function calculateScore(timeMs: number): number {
  if (timeMs === 0) return 1000
  if (timeMs >= 5000) return 50
  
  // Logarithmic scaling between 50 and 1000 points
  const minScore = 50
  const maxScore = 1000
  const minTime = 0
  const maxTime = 5000
  
  const normalizedTime = (timeMs - minTime) / (maxTime - minTime)
  const score = maxScore - (maxScore - minScore) * Math.log10(1 + 9 * normalizedTime)
  
  return Math.round(score)
}

export function useDailyChallenge() {
  const state = ref<ChallengeState>(ChallengeState.NOT_STARTED)
  const currentCountryIndex = ref(0)
  const results = ref<ChallengeResult[]>([])
  const startTime = ref<number | null>(null)
  const currentScore = ref(0)
  const totalTimeMs = ref(0)
  
  // Generate 10 random countries and zoom levels for the day
  const dailyChallenge = computed(() => {
    const seed = getDailySeed()
    const countries = [...availableCountries.value]
    const challengeCountries: { country: string; zoomLevel: number }[] = []
    
    for (let i = 0; i < 10; i++) {
      const country = countries[seededRandomInt(seed + i, 0, countries.length)]
      // Generate random zoom level between 100 (world view) and 175 (zoomed in)
      const zoomLevel = seededRandomInt(seed + i + 1000, 100, 176)
      challengeCountries.push({ country, zoomLevel })
    }
    
    return challengeCountries
  })
  
  // Check if challenge has been completed today
  const hasCompletedToday = () => {
    const today = new Date().toISOString().split('T')[0]
    return localStorage.getItem(`challenge_completed_${today}`) === 'true'
  }
  
  // Start the challenge
  const startChallenge = () => {
    if (hasCompletedToday()) {
      throw new Error('Challenge already completed today')
    }
    
    state.value = ChallengeState.IN_PROGRESS
    currentCountryIndex.value = 0
    results.value = []
    startTime.value = Date.now()
    currentScore.value = 0
    totalTimeMs.value = 0
  }
  
  // Show rules
  const showRules = () => {
    state.value = ChallengeState.RULES_SHOWN
  }
  
  // Handle country completion
  const handleCountryCompletion = (correct: boolean, timeMs: number) => {
    if (state.value !== ChallengeState.IN_PROGRESS || !startTime.value) return
    
    console.log('handleCountryCompletion - Before:', {
      currentIndex: currentCountryIndex.value,
      resultsLength: results.value.length,
      state: state.value
    })
    
    const currentCountry = dailyChallenge.value[currentCountryIndex.value]
    const score = correct ? calculateScore(timeMs) : 0
    
    results.value.push({
      country: currentCountry.country,
      correct,
      timeMs,
      zoomLevel: currentCountry.zoomLevel
    })
    
    currentScore.value += score
    totalTimeMs.value += timeMs
    
    console.log('handleCountryCompletion - After push:', {
      resultsLength: results.value.length,
      lastResult: results.value[results.value.length - 1]
    })
    
    // Move to next country
    if (currentCountryIndex.value < 9) {
      currentCountryIndex.value++
    }

    console.log('handleCountryCompletion - End:', {
      currentIndex: currentCountryIndex.value,
      resultsLength: results.value.length,
      state: state.value
    })
  }
  
  return {
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
    ChallengeState // Export the enum for use in components
  }
} 