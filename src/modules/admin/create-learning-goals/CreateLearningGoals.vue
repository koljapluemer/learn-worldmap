<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorldMap from '@/modules/map-renderer/WorldMap.vue'
import countryList from '@/modules/map-data/country-lists/all-countries.json'

// Component state
const selectedCountry = ref('')
const zoomLevel = ref(100)

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
            <div class="overflow-hidden relative" style="width: 300px; height: 150px;">
                <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                    :zoomLevel="zoomLevel" />
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
