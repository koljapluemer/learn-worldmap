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
        <p>2. Each country has a different zoom level</p>
        <p>3. Score points based on accuracy and speed:</p>
        <ul class="list-disc list-inside ml-4">
          <li>1000 points for correct first try</li>
          <li>50-1000 points based on time taken</li>
          <li>0 points for incorrect attempts</li>
        </ul>
        <p>4. Challenge can only be completed once per day</p>
      </div>
      
      <div class="flex justify-end gap-2">
        <button 
          class="btn btn-ghost"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button 
          class="btn btn-primary"
          @click="$emit('start')"
        >
          Start Challenge
        </button>
      </div>
    </div>
  </div>
</template> 