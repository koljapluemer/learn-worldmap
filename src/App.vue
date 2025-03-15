<template>
  <div class="min-h-screen bg-base-200">
    <header class="bg-base-100 shadow-sm px-4 py-2">
      <div class="flex items-center justify-between">
        <h1 class="font-medium">Learn the World Map</h1>
          <ul class="flex gap-1">
            <li><router-link class="btn btn-sm" :to="{ name: 'play' }">Play</router-link></li>
            <li><router-link  class="btn btn-sm" :to="{ name: 'stats' }">Stats</router-link></li>
          </ul>
      </div>
    </header>

    <!-- Instruction card - will be rendered by child components when needed -->
      <slot name="instruction" class="mb-2 p-4 bg-base-100 shadow-md rounded-lg text-base leading-relaxed" />

    <!-- Main content area - no margins/padding -->
    <div class="relative">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
