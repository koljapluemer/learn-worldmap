<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorldMap from '@/modules/map-renderer/WorldMap.vue'
import countryList from '@/modules/map-data/country-lists/all-countries.json'

// Component state
const selectedCountry = ref('')
const zoomLevel = ref(108)
const zoomLevel3 = ref(118)
const pendingZoomLevel2 = ref(zoomLevel.value)
const pendingZoomLevel3 = ref(zoomLevel3.value)
const enabled2 = ref(true)
const enabled3 = ref(true)


function pickRandomCountry() {
    const idx = Math.floor(Math.random() * countryList.length)
    selectedCountry.value = countryList[idx]
}

function commitZoomLevel2() {
    zoomLevel.value = pendingZoomLevel2.value
}
function commitZoomLevel3() {
    zoomLevel3.value = pendingZoomLevel3.value
}

onMounted(() => {
    pickRandomCountry()
    pendingZoomLevel2.value = zoomLevel.value
    pendingZoomLevel3.value = zoomLevel3.value
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
            <!-- Second column: 4 stacked maps with slider and enable -->
            <div :style="{ opacity: enabled2 ? 1 : 0.3 }" class="flex flex-col items-center gap-2">
                <div class="flex items-center w-full mb-2 gap-2">
                    <input type="checkbox" v-model="enabled2" id="enable2" class="toggle toggle-primary" />
                    <label for="enable2" class="select-none font-semibold">Enable</label>
                    <input type="range" min="90" max="150" v-model.number="pendingZoomLevel2" class="range range-primary flex-1 mx-2"
                        @change="commitZoomLevel2" @mouseup="commitZoomLevel2" />
                    <input type="number" min="90" max="150" v-model.number="pendingZoomLevel2" class="input input-bordered w-16 text-right"
                        @change="commitZoomLevel2" @blur="commitZoomLevel2" />
                </div>
                <div class="flex flex-col gap-2">
                    <div v-for="i in 4" :key="'map2-' + i + '-' + zoomLevel" class="overflow-hidden relative" style="width: 300px; height: 150px;">
                        <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                            :zoomLevel="zoomLevel" :targetCountry="selectedCountry" />
                    </div>
                </div>
            </div>
            <!-- Third column: 4 stacked maps with independent slider and enable -->
            <div :style="{ opacity: enabled3 ? 1 : 0.3 }" class="flex flex-col items-center gap-2">
                <div class="flex items-center w-full mb-2 gap-2">
                    <input type="checkbox" v-model="enabled3" id="enable3" class="toggle toggle-primary" />
                    <label for="enable3" class="select-none font-semibold">Enable</label>
                    <input type="range" min="102" max="200" v-model.number="pendingZoomLevel3" class="range range-primary flex-1 mx-2"
                        @change="commitZoomLevel3" @mouseup="commitZoomLevel3" />
                    <input type="number" min="102" max="200" v-model.number="pendingZoomLevel3" class="input input-bordered w-16 text-right"
                        @change="commitZoomLevel3" @blur="commitZoomLevel3" />
                </div>
                <div class="flex flex-col gap-2">
                    <div v-for="i in 4" :key="'map3-' + i + '-' + zoomLevel3" class="overflow-hidden relative" style="width: 300px; height: 150px;">
                        <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                            :zoomLevel="zoomLevel3" :targetCountry="selectedCountry" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
