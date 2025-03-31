<template>
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Settings</h1>
        <button 
          @click="resetToDefaults" 
          class="btn btn-outline btn-sm"
        >
          Reset to Defaults
        </button>
      </div>
      
      <div class="space-y-4">
        <!-- Water Color Setting -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Water Color</span>
          </label>
          <div class="flex gap-2 items-center">
            <input 
              type="color" 
              v-model="waterColor" 
              class="w-20 h-10 rounded cursor-pointer"
            />
            <input 
              type="text" 
              v-model="waterColor" 
              class="input input-bordered w-32"
            />
          </div>
        </div>

        <!-- Land Color Setting -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Land Color</span>
          </label>
          <div class="flex gap-2 items-center">
            <input 
              type="color" 
              v-model="landColor" 
              class="w-20 h-10 rounded cursor-pointer"
            />
            <input 
              type="text" 
              v-model="landColor" 
              class="input input-bordered w-32"
            />
          </div>
        </div>

        <!-- Border Color Setting -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Border Color</span>
          </label>
          <div class="flex gap-2 items-center">
            <input 
              type="color" 
              v-model="borderColor" 
              class="w-20 h-10 rounded cursor-pointer"
            />
            <input 
              type="text" 
              v-model="borderColor" 
              class="input input-bordered w-32"
            />
          </div>
        </div>

        <!-- Border Thickness Setting -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Border Thickness (px)</span>
          </label>
          <input 
            type="number" 
            v-model="borderThickness" 
            min="0" 
            max="20"
            class="input input-bordered w-32"
          />
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Default values
const DEFAULT_WATER_COLOR = '#dcefff'
const DEFAULT_LAND_COLOR = '#e6e6e6'
const DEFAULT_BORDER_COLOR = '#333333'
const DEFAULT_BORDER_THICKNESS = 8

// Reactive state
const waterColor = ref(localStorage.getItem('waterColor') || DEFAULT_WATER_COLOR)
const landColor = ref(localStorage.getItem('landColor') || DEFAULT_LAND_COLOR)
const borderColor = ref(localStorage.getItem('borderColor') || DEFAULT_BORDER_COLOR)
const borderThickness = ref(Number(localStorage.getItem('borderThickness')) || DEFAULT_BORDER_THICKNESS)

// Reset function
const resetToDefaults = () => {
  waterColor.value = DEFAULT_WATER_COLOR
  landColor.value = DEFAULT_LAND_COLOR
  borderColor.value = DEFAULT_BORDER_COLOR
  borderThickness.value = DEFAULT_BORDER_THICKNESS
}

// Watch for changes and persist to localStorage
watch(waterColor, (newValue) => {
  localStorage.setItem('waterColor', newValue)
})

watch(landColor, (newValue) => {
  localStorage.setItem('landColor', newValue)
})

watch(borderColor, (newValue) => {
  localStorage.setItem('borderColor', newValue)
})

watch(borderThickness, (newValue) => {
  localStorage.setItem('borderThickness', String(newValue))
})
</script>