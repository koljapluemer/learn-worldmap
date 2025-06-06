<template>
  <header class="flex flex-row justify-between items-center p-1">
    <h1 class="font-bold">Learn the World Map</h1>

    <nav class="flex flex-row gap-2">
      <router-link 
        to="/play"
        class="btn"
      >
        <IconFilter />
        <span class="hidden md:block">Filter Countries</span>
      </router-link>
      <router-link 
        to="/settings"
        class="btn"
      >
        <IconSettings />
        <span class="hidden md:block">Settings</span>
      </router-link>
      <router-link 
        to="/stats"
        class="btn"
      >
        <IconStats />
        <span class="hidden md:block">Stats</span>
      </router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
import IconFilter from '@/modules/icons/IconFilter.vue'
import IconSettings from '@/modules/icons/IconSettings.vue'
import IconStats from '@/modules/icons/IconStats.vue'
</script>