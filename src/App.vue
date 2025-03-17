<template>
  <div class="min-h-screen bg-base-200">
    <header class="bg-base-100 shadow-sm p-1 ">
      <div class="flex items-center justify-between">
        <h1 class="text-xs md:text-base font-medium">Learn the World Map</h1>
          <ul class="flex gap-0.5 md:gap-1">
            <li><router-link class="btn btn-xs md:btn-sm" :to="{ name: 'play' }">Play</router-link></li>
            <li><router-link class="btn btn-xs md:btn-sm" :to="{ name: 'challenge' }">Challenge</router-link></li>
            <li><router-link class="btn btn-xs md:btn-sm" :to="{ name: 'stats' }">Stats</router-link></li>
          </ul>
      </div>
    </header>

    <!-- Progress bar -->
    <div class="h-1 bg-base-200">
      <div class="flex h-full">
        <div 
          class="bg-success transition-all duration-300" 
          :style="{ width: `${progressPercentages.notDue}%` }"
        ></div>
        <div 
          class="bg-warning transition-all duration-300" 
          :style="{ width: `${progressPercentages.due}%` }"
        ></div>
        <div 
          class="bg-base-300 transition-all duration-300" 
          :style="{ width: `${progressPercentages.neverLearned}%` }"
        ></div>
      </div>
    </div>

    <!-- Instruction card - will be rendered by child components when needed -->
      <slot name="instruction" class="mb-2 p-4 bg-base-100 shadow-md rounded-lg text-base leading-relaxed" />

    <!-- Main content area - no margins/padding -->
    <div class="relative">
      <RouterView />
    </div>

    <!-- Footer -->
    <footer class="p-4 text-center text-xs text-base-content/70">
      <p class="mb-1">
        Made with ♥ by <a href="https://koljapluemer.com" target="_blank" rel="noopener noreferrer" class="link">Kolja Sam</a> 
      </p>
      <p class="max-w-md mx-auto">
        I'm using the privacy-friendly <a href="https://www.goatcounter.com" target="_blank" rel="noopener noreferrer" class="link">Goatcounter</a> to track page views and an I store some pseudonymous learning data. No personal data is collected, and cookies are used solely for tracking your learning progress on your device. This app is <a href="https://github.com/koljapluemer/learn-worldmap" target="_blank" rel="noopener noreferrer" class="link">open source</a>.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted, watch, onUnmounted } from 'vue';
import { useLearningProgress } from './composables/useLearningProgress';
import { availableCountries } from './services/mapData';

const { progressPercentages, setAvailableCountries, updateProgress } = useLearningProgress();

// Initialize progress tracking
onMounted(async () => {
  setAvailableCountries(availableCountries.value);
  await updateProgress();
  
  // Listen for progress update events
  window.addEventListener('learning-progress-update', updateProgress);
});

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('learning-progress-update', updateProgress);
});

// Update progress when route changes
watch(() => window.location.hash, async () => {
  await updateProgress();
});
</script>
