<template>
  <div class="min-h-screen bg-base-200">
    <header class="bg-base-100 shadow-sm p-1 ">
      <div class="flex items-center justify-between">
        <h1 class="text-xs md:text-base font-medium">Learn the World Map</h1>
      </div>
    </header>


    <!-- Instruction card - will be rendered by child components when needed -->
    <slot name="instruction" class="mb-2 p-4 bg-base-100 shadow-md rounded-lg text-base leading-relaxed" />

    <!-- Main content area - no margins/padding -->
    <div class="relative">
      <Play />
    </div>

    <!-- Footer -->
    <footer class="p-4 flex flex-col items-center gap-4 text-center text-xs text-base-content/70">
      <p class="flex flex-row gap-4 items-center">
        <span>
          Made with ♥ by <a href="https://koljapluemer.com" target="_blank" rel="noopener noreferrer" class="link">Kolja
            Sam</a>
        </span>
        <a href='https://ko-fi.com/S6S81CWUVD' target='_blank'><img height='36' style='border:0px;height:36px;'
            src='https://storage.ko-fi.com/cdn/kofi4.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
      </p>

      <p class="max-w-md">
        I'm using the privacy-friendly <a href="https://www.goatcounter.com" target="_blank" rel="noopener noreferrer"
          class="link">Goatcounter</a> to track page views and an I store some pseudonymous learning data. No personal
        data is collected, and cookies are used solely for tracking your learning progress on your device. This app is
        <a href="https://github.com/koljapluemer/learn-worldmap" target="_blank" rel="noopener noreferrer"
          class="link">open source</a>.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Play from '@/modules/play/Play.vue';
</script>
