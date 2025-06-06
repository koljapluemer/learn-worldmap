<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import WorldMap from '@/modules/map-renderer/WorldMap.vue'
import countryList from '@/modules/map-data/country-lists/all-countries.json'

// Component state
const selectedCountry = ref('')
const zoomLevel = ref(110)

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



onMounted(() => {
    pickRandomCountry()
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
                :targetCountry="selectedCountry" />
            </div>
            <!-- Second column: 4 stacked maps with slider -->
            <div class="flex flex-col items-center gap-2">
                <div class="flex items-center w-full mb-2">
                    <input type="range" min="102" max="130" v-model.number="zoomLevel" class="range range-primary flex-1" @change="commitZoomLevel" @mouseup="commitZoomLevel" />
                    <span class="ml-2 w-10 text-right">{{ zoomLevel }}</span>
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
