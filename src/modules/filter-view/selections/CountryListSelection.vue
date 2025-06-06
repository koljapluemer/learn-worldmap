<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCountrySelection } from './useCountrySelection'

const { countrySelection, selectedCount, toggleCountry } = useCountrySelection()

// Search functionality
const searchQuery = ref('')
const filteredCountries = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return Object.keys(countrySelection.value)
    .filter(country => country.toLowerCase().includes(query))
    .sort()
})
</script>

<template>
  <div class="p-4">
    <!-- Search input -->
    <div class="mb-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search countries..."
        class="input input-bordered w-full"
      />
    </div>

    <!-- Selected count -->
    <div class="text-sm text-base-content/70 mb-4">
      {{ selectedCount }} countries selected
    </div>

    <!-- Country list -->
    <div class="space-y-2 max-h-[60vh] overflow-y-auto">
      <div
        v-for="country in filteredCountries"
        :key="country"
        class="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg transition-colors"
      >
        <input
          type="checkbox"
          :checked="countrySelection[country]"
          @change="toggleCountry(country)"
          class="checkbox checkbox-primary"
        />
        <span class="flex-1">{{ country }}</span>
      </div>
    </div>
  </div>
</template> 