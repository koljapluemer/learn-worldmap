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
import { DEFAULT_MAP_SETTINGS, getMapSettings } from '@/modules/misc-views/settings-view/defaultSettings'

// Get initial settings
const settings = ref(getMapSettings())

// Reactive state
const waterColor = ref(settings.value.waterColor)
const landColor = ref(settings.value.landColor)
const borderColor = ref(settings.value.borderColor)
const borderThickness = ref(settings.value.borderThickness)

// Reset function
const resetToDefaults = () => {
  waterColor.value = DEFAULT_MAP_SETTINGS.waterColor
  landColor.value = DEFAULT_MAP_SETTINGS.landColor
  borderColor.value = DEFAULT_MAP_SETTINGS.borderColor
  borderThickness.value = DEFAULT_MAP_SETTINGS.borderThickness
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