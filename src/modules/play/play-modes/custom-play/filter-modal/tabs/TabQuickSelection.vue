<script setup lang="ts">
import { useCountrySelection } from './useCountrySelection'

const { countrySelection, selectedCount, toggleCountry } = useCountrySelection()

// Batch selection functions
const selectAll = () => {
  Object.keys(countrySelection.value).forEach(country => {
    countrySelection.value[country] = true
  })
}

const deselectAll = () => {
  Object.keys(countrySelection.value).forEach(country => {
    countrySelection.value[country] = false
  })
}
</script>

<template>
  <div class="p-4">
    <!-- Selected count -->
    <div class="text-sm text-base-content/70 mb-4">
      {{ selectedCount }} countries selected
    </div>

    <!-- Batch selection buttons -->
    <div class="flex gap-4 mb-6">
      <button 
        class="btn btn-primary flex-1"
        @click="selectAll"
      >
        Select All
      </button>
      <button 
        class="btn btn-outline flex-1"
        @click="deselectAll"
      >
        Deselect All
      </button>
    </div>

    <!-- More quick selection options will go here -->
  </div>
</template> 