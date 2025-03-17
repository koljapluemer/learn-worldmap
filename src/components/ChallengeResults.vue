<script setup lang="ts">
import { computed } from 'vue'
import * as d3 from 'd3'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  results: Array<{
    country: string
    correct: boolean
    timeMs: number
    zoomLevel: number
  }>
  totalScore: number
  totalTimeMs: number
  averageTimeMs: number
}>()

const emit = defineEmits<{
  (e: 'share', platform: string): void
}>()

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const milliseconds = ms % 1000
  return `${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`
}

const sortedResults = computed(() => {
  return [...props.results].sort((a, b) => b.timeMs - a.timeMs)
})

const shareMessage = computed(() => {
  const date = new Date().toISOString().split('T')[0]
  const emojis = props.results.map(r => r.correct ? '✅' : '❌').join('')
  const totalTime = formatTime(props.totalTimeMs)
  
  return `🌍 Daily Geography Challenge ${date}\n\n` +
         `Score: *${props.totalScore}* points\n` +
         `Time: *${totalTime}*\n\n` +
         `Results: ${emojis}\n\n` +
         `Can you beat my score?\n` +
         `Play at https://map.koljapluemer.com/challenge`
})

const shareLinks = {
  twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage.value)}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage.value)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent('https://map.koljapluemer.com/challenge')}&text=${encodeURIComponent(shareMessage.value)}`,
  mastodon: `https://mastodon.social/share?text=${encodeURIComponent(shareMessage.value)}`
}

const copyToClipboard = async () => {
  await navigator.clipboard.writeText(shareMessage.value)
  emit('share', 'clipboard')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-base-100 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4">Challenge Complete!</h2>
      
      <!-- Score Summary -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-base-200 p-4 rounded-lg">
          <div class="text-sm text-base-content/70">Total Score</div>
          <div class="text-2xl font-bold">{{ totalScore }}</div>
        </div>
        <div class="bg-base-200 p-4 rounded-lg">
          <div class="text-sm text-base-content/70">Total Time</div>
          <div class="text-2xl font-bold">{{ formatTime(totalTimeMs) }}</div>
        </div>
        <div class="bg-base-200 p-4 rounded-lg">
          <div class="text-sm text-base-content/70">Average Time</div>
          <div class="text-2xl font-bold">{{ formatTime(averageTimeMs) }}</div>
        </div>
        <div class="bg-base-200 p-4 rounded-lg">
          <div class="text-sm text-base-content/70">Success Rate</div>
          <div class="text-2xl font-bold">
            {{ Math.round((results.filter(r => r.correct).length / results.length) * 100) }}%
          </div>
        </div>
      </div>
      
      <!-- Results Chart -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Results by Country</h3>
        <div class="bg-base-200 rounded-lg p-4">
          <div class="overflow-x-auto">
            <div class="min-w-[500px] h-48">
              <div class="flex h-full items-end gap-1">
                <div 
                  v-for="(result, index) in sortedResults" 
                  :key="index"
                  class="flex-1 bg-base-300 rounded-t"
                  :style="{
                    height: `${(result.timeMs / 5000) * 100}%`,
                    backgroundColor: result.correct ? '#22c55e' : '#ef4444'
                  }"
                >
                  <div class="text-xs text-center mt-1">
                    {{ formatTime(result.timeMs) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Share Section -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Share Your Results</h3>
        <div class="flex flex-wrap gap-2">
          <a 
            :href="shareLinks.twitter"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm"
          >
            Twitter
          </a>
          <a 
            :href="shareLinks.whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm"
          >
            WhatsApp
          </a>
          <a 
            :href="shareLinks.telegram"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm"
          >
            Telegram
          </a>
          <a 
            :href="shareLinks.mastodon"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm"
          >
            Mastodon
          </a>
          <button 
            class="btn btn-sm"
            @click="copyToClipboard"
          >
            Copy Text
          </button>
        </div>
      </div>

      <!-- Back to Play Button -->
      <div class="flex justify-end">
        <button 
          class="btn btn-primary"
          @click="router.push({ name: 'play' })"
        >
          Back to Play
        </button>
      </div>
    </div>
  </div>
</template> 