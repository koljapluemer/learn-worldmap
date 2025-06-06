<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import WorldMap from '@/modules/map-renderer/WorldMap.vue'
import countryList from '@/modules/map-data/country-lists/all-countries.json'

// Component state
const selectedCountry = ref('')
const zoomLevel = ref(100)
const pendingZoomLevel = ref(100)

// Props and emits
defineProps<{
    // Add props if needed
}>()

defineEmits<{
    // Add emits if needed
}>()

function pickRandomCountry() {
    const idx = Math.floor(Math.random() * countryList.length)
    selectedCountry.value = countryList[idx]
}

function commitZoomLevel() {
    // Cap value between 100 and 200
    zoomLevel.value = Math.max(100, Math.min(200, pendingZoomLevel.value))
    pendingZoomLevel.value = zoomLevel.value
}

onMounted(() => {
    pickRandomCountry()
    pendingZoomLevel.value = zoomLevel.value
})

// Also cap pendingZoomLevel if user tries to set it out of bounds
watch(pendingZoomLevel, (val) => {
    if (val < 100) pendingZoomLevel.value = 100
    if (val > 200) pendingZoomLevel.value = 200
})
</script>

<template>
    <div class="container mx-auto p-4">
        <div class="flex flex-col items-start mb-4 gap-2">
            <button class="btn btn-primary" @click="pickRandomCountry">Random Country</button>
            <div class="text-lg">Current: <span class="font-bold">{{ selectedCountry }}</span></div>
        </div>
        <div class="flex flex-row gap-4">
            <!-- First column: main map -->
            <div class="overflow-hidden relative" style="width: 300px; height: 150px;">
                <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                    :zoomLevel="zoomLevel" :targetCountry="selectedCountry" :key="'main-' + zoomLevel" />
            </div>
            <!-- Second column: 4 stacked maps with slider -->
            <div class="flex flex-col items-center gap-2">
                <div class="flex items-center w-full mb-2">
                    <input type="range" min="100" max="200" v-model.number="pendingZoomLevel" class="range range-primary flex-1" @change="commitZoomLevel" @mouseup="commitZoomLevel" />
                    <span class="ml-2 w-10 text-right">{{ pendingZoomLevel }}</span>
                </div>
                <div class="flex flex-col gap-2">
                    <div v-for="i in 4" :key="'map-' + i + '-' + zoomLevel" class="overflow-hidden relative" style="width: 300px; height: 150px;">
                        <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                            :zoomLevel="zoomLevel" :targetCountry="selectedCountry" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.map-scale {
    width: 300px;
    height: 150px;
}
</style>
