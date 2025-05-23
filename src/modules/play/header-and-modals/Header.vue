<template>
  <header class="flex flex-row justify-between items-center p-1">
    <h1 class="font-bold">Learn the World Map</h1>

    <nav class="flex flex-row gap-2">
      <button 
        class="btn"
        @click="isFilterModalOpen = true"
      >
        <IconFilter />
        <span class="hidden md:block">Filter Countries</span>
      </button>
      <button 
        class="btn"
        @click="isSettingsModalOpen = true"
      >
        <IconSettings />
        <span class="hidden md:block">Settings</span>
      </button>
      <button 
        class="btn"
        @click="isStatsModalOpen = true"
      >
        <IconStats />
        <span class="hidden md:block">Stats</span>
      </button>
    </nav>
  </header>

  <FilterModal
      :is-open="isFilterModalOpen"
      @close="isFilterModalOpen = false"
    />
</template>


<script setup lang="ts">

import { ref } from 'vue'
import IconFilter from '@/modules/icons/IconFilter.vue'
import IconSettings from '@/modules/icons/IconSettings.vue'
import IconStats from '@/modules/icons/IconStats.vue'
import FilterModal from '@/modules/filter-modal/FilterModal.vue'

const isFilterModalOpen = ref(false)
const isSettingsModalOpen = ref(false)
const isStatsModalOpen = ref(false)
</script>