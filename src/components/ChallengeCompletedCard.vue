<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h2 class="text-2xl font-bold mb-4">Challenge Already Completed</h2>
      
      <div class="space-y-4 mb-6">
        <p>You've already completed today's challenge! Come back tomorrow for a new set of countries.</p>
        <p>In the meantime, you can practice in the regular play mode to improve your skills.</p>
      </div>
      
      <div class="flex justify-end">
        <button 
          class="btn btn-primary"
          @click="router.push({ name: 'play' })"
        >
          Go to Play Mode
        </button>
      </div>
    </div>
  </div>
</template> 