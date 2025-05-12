<script setup lang="ts">
import { ref } from 'vue'
import { useCountrySelection } from './useCountrySelection'
import { getAfricaCountries } from '@/modules/map-data/mapData'

const { countrySelection } = useCountrySelection()
const showSuccess = ref(false)

const practiceOnlyAfrica = () => {
  // Get all countries
  const allCountries = Object.keys(countrySelection.value)
  
  // Deselect all countries first
  allCountries.forEach(country => {
    countrySelection.value[country] = false
  })
  
  // Select only African countries
  const africanCountries = getAfricaCountries()
  africanCountries.forEach(country => {
    countrySelection.value[country] = true
  })

  // Show success message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 2000)
}
</script>

<template>
  <div class="p-4 flex justify-center">
    <div class="card w-96 bg-base-200 shadow-xl">
      <figure>
        <img src="@/modules/map-data/country-lists/africa.webp" alt="Map of Africa Image" class="object-cover w-full h-48" />
      </figure>
      <div class="card-body">
        <!-- Success message -->
        <div v-if="showSuccess" class="alert alert-success mb-4">
          <div class="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Now practicing only African countries</span>
          </div>
        </div>
        <!-- Wizard buttons -->
        <button 
          class="btn btn-secondary mb-2"
          @click="practiceOnlyAfrica"
        >
          Practice Only Africa
        </button>
        <p class="text-sm text-base-content/70">
          Focus your learning on African countries. All other countries will be deselected.
        </p>
      </div>
    </div>
  </div>
</template> 