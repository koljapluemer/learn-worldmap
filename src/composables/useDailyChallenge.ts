import { ref, computed } from 'vue'
import { availableCountries } from '../services/mapData'

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

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// Generate daily seed from UTC date
function getDailySeed(): number {
  const now = new Date()
  const utcDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
  return utcDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
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
      const randomIndex = Math.floor(seededRandom(seed + i) * countries.length)
      const country = countries[randomIndex]
      // Generate random zoom level between 100 (world view) and 175 (zoomed in)
      const zoomLevel = Math.floor(seededRandom(seed + i + 1000) * 75) + 100
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
    
    // Move to next country or end challenge
    if (currentCountryIndex.value < 9) {
      currentCountryIndex.value++
    } else {
      endChallenge()
    }
  }
  
  // End the challenge and save completion status
  const endChallenge = () => {
    if (!startTime.value) return
    
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`challenge_completed_${today}`, 'true')
    state.value = ChallengeState.COMPLETED
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
    endChallenge,
    ChallengeState // Export the enum for use in components
  }
} 