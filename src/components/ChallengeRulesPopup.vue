<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start'): void
}>()

const router = useRouter()
const countdown = ref(3)
const isCountingDown = ref(false)

const startCountdown = () => {
  isCountingDown.value = true
  countdown.value = 3
  
  const interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
      isCountingDown.value = false
      emit('start')
    }
  }, 1000)
}

const goToPractice = () => {
  router.push({ name: 'play' })
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h2 class="text-2xl font-bold mb-4">Daily Challenge Rules</h2>
      
      <div class="space-y-4 mb-6">
        <p>1. You'll be presented with 10 random countries to locate</p>
        <p>2. Place the red circle on the country as fast as you can</p>
        <p>3. You will get more points the faster you are, but miss and you get 0 points</p>
        <p>4. Challenge can only be completed once per day</p>
        <p class="text-xs">By the way, you don't need to zoom. You only need to be as accurate as the circle is big.</p>
      </div>
      
      <!-- Countdown Display -->
      <div v-if="isCountingDown" class="text-center mb-6">
        <div class="text-6xl font-bold text-primary">{{ countdown }}</div>
      </div>
      
      <div class="flex justify-end gap-2">
        <button 
          class="btn btn-ghost"
          @click="goToPractice"
        >
          Practice
        </button>
        <button 
          class="btn btn-primary"
          @click="startCountdown"
          :disabled="isCountingDown"
        >
          Start Challenge
        </button>
      </div>
    </div>
  </div>
</template> 