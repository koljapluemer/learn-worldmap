<script setup lang="ts">
const props = defineProps<{
  availableContinents: string[]
  selectedContinents: string[]
  onToggle: (continent: string) => void
}>()

// Helper function to get continent icon
const getContinentIcon = (continent: string) => {
  const icons: Record<string, string> = {
    'Africa': '🌍',
    'Antarctica': '❄️',
    'Asia': '🌏',
    'Europe': '🌍',
    'North America': '🌎',
    'Oceania': '🏝️',
    'South America': '🌎',
    'Seven seas (open ocean)': '🌊'
  }
  return icons[continent] || '🌐'
}
</script>

<template>
  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-xl font-bold mb-4">Select Continents to Practice</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="continent in availableContinents"
          :key="continent"
          class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          :class="{ 'ring-2 ring-primary': selectedContinents.includes(continent) }"
          @click="onToggle(continent)"
        >
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ getContinentIcon(continent) }}</span>
              <div class="flex-1">
                <h3 class="font-semibold">{{ continent }}</h3>
                <p class="text-sm text-base-content/70">
                  {{ selectedContinents.includes(continent) ? 'Selected' : 'Click to select' }}
                </p>
              </div>
              <input
                type="checkbox"
                :checked="selectedContinents.includes(continent)"
                class="checkbox checkbox-primary"
                @click.stop
                @change="onToggle(continent)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 