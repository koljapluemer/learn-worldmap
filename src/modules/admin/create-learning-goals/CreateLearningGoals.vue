<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorldMap from '@/modules/map-renderer/WorldMap.vue'
import countryList from '@/modules/map-data/country-lists/all-countries.json'
import type { ExerciseTemplateData, LessonData } from 'igu-schemas'

// Component state
const selectedCountry = ref('')
const zoomLevel = ref(108)
const zoomLevel3 = ref(118)
const pendingZoomLevel2 = ref(zoomLevel.value)
const pendingZoomLevel3 = ref(zoomLevel3.value)
const enabled2 = ref(true)
const enabled3 = ref(true)

function getLearningGoals(): Record<string, LessonData> {
    const raw = localStorage.getItem('learningGoals')
    return raw ? JSON.parse(raw) : {}
}

function setLearningGoals(goals: Record<string, LessonData>) {
    localStorage.setItem('learningGoals', JSON.stringify(goals, null, 2))
}

function saveAndNext() {
    const goals = getLearningGoals()
    const country = selectedCountry.value
    if (!goals[country]) {
        const countryId = country.toLowerCase().replace(/\s+/g, '-')
        goals[country] = {
            id: `lesson-${countryId}`,
            name: `Know where ${country} is`,
            templates: [{
                id: `${countryId}-1`,
                instruction: `$task_pre ${country} $task_post`,
                exerciseType: {
                    name: 'BY_INSTRUCTION'
                },
                generator: {
                    name: 'SINGLE'
                },
                data: {
                    zoom: 100,
                    scope: 'world'
                }
            }],
            data: {
                country
            }
        }
    }
    
    // Create exercise templates for this country
    const templates: ExerciseTemplateData[] = []
    const countryId = country.toLowerCase().replace(/\s+/g, '-')
    
    // Always add world goal
    templates.push({
        id: `${countryId}-1`,
        instruction: `$task_pre ${country} $task_post`,
        exerciseType: {
            name: 'BY_INSTRUCTION'
        },
        generator: {
            name: 'SINGLE'
        },
        data: {
            zoom: 100,
            scope: 'world'
        }
    })
    
    // Add region goal if enabled
    if (enabled2.value) {
        templates.push({
            id: `${countryId}-2`,
            instruction: `$task_pre ${country} $task_post`,
            exerciseType: {
                name: 'BY_INSTRUCTION'
            },
            generator: {
                name: 'VARY_PROPERTY_WHOLE_NUMBER_RANGE',
                data: {
                    propertyToVary: 'panField',
                    lowestVariationNumber: 0,
                    highestVariationNumber: 8
                }
            },
            data: {
                zoom: zoomLevel.value,
                scope: 'region'
            },
            blockedBy: [`${countryId}-1`]
        })
    }
    
    // Add neighborhood goal if enabled
    if (enabled3.value) {
        templates.push({
            id: `${countryId}-3`,
            instruction: `$task_pre ${country} $task_post`,
            exerciseType: {
                name: 'BY_INSTRUCTION'
            },
            generator: {
                name: 'VARY_PROPERTY_WHOLE_NUMBER_RANGE',
                data: {
                    propertyToVary: 'panField',
                    lowestVariationNumber: 0,
                    highestVariationNumber: 8
                }
            },
            data: {
                zoom: zoomLevel3.value,
                scope: 'neighborhood'
            },
            blockedBy: [`${countryId}-2`]
        })
    }
    
    // Update the lesson data
    goals[country] = {
        id: `lesson-${countryId}`,
        name: `Know where ${country} is`,
        templates,
        data: {
            country
        }
    }
    
    setLearningGoals(goals)
    
    // Pick a new country not yet in goals
    const remaining = countryList.filter(c => !goals[c])
    if (remaining.length > 0) {
        selectedCountry.value = remaining[Math.floor(Math.random() * remaining.length)]
    } else {
        selectedCountry.value = ''
        alert('All countries done!')
    }
}

function logLearningGoals() {
    const goals = getLearningGoals()
    // Transform the goals object into a LessonData array
    const lessonDataArray: LessonData[] = Object.values(goals)
    console.log(lessonDataArray)
}

function commitZoomLevel2() {
    zoomLevel.value = pendingZoomLevel2.value
}
function commitZoomLevel3() {
    zoomLevel3.value = pendingZoomLevel3.value
}

onMounted(() => {
    // Pick a random country not yet in goals
    const goals = getLearningGoals()
    const remaining = countryList.filter(c => !goals[c])
    if (remaining.length > 0) {
        selectedCountry.value = remaining[Math.floor(Math.random() * remaining.length)]
    } else {
        selectedCountry.value = ''
    }
    pendingZoomLevel2.value = zoomLevel.value
    pendingZoomLevel3.value = zoomLevel3.value
})
</script>

<template>
    <div class="container mx-auto p-4">
        <div class="flex flex-col items-start mb-4 gap-2">
            <button class="btn btn-primary" @click="saveAndNext">Save and Next</button>
            <button class="btn btn-secondary" @click="logLearningGoals">Log Data</button>
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
                    <input type="range" min="101" max="150" v-model.number="pendingZoomLevel2" class="range range-primary flex-1 mx-2"
                        @change="commitZoomLevel2" @mouseup="commitZoomLevel2" />
                    <input type="number" min="101" max="150" v-model.number="pendingZoomLevel2" class="input input-bordered w-16 text-right"
                        @change="commitZoomLevel2" @blur="commitZoomLevel2" />
                </div>
                <div class="flex flex-col gap-2">
                    <!-- Landscape maps stacked -->
                    <div v-for="i in 2" :key="'map2-landscape-' + i + '-' + zoomLevel"
                        class="overflow-hidden relative" style="width: 300px; height: 150px;">
                        <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                            :zoomLevel="zoomLevel" :targetCountry="selectedCountry" />
                    </div>
                    <!-- Mobile maps side by side -->
                    <div class="flex flex-row gap-2 mt-2">
                        <div v-for="i in 2" :key="'map2-mobile-' + i + '-' + zoomLevel"
                            class="overflow-hidden relative" style="width: 180px; height: 320px;">
                            <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                                :zoomLevel="zoomLevel" :targetCountry="selectedCountry" />
                        </div>
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
                    <!-- Landscape maps stacked -->
                    <div v-for="i in 2" :key="'map3-landscape-' + i + '-' + zoomLevel3"
                        class="overflow-hidden relative" style="width: 300px; height: 150px;">
                        <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                            :zoomLevel="zoomLevel3" :targetCountry="selectedCountry" />
                    </div>
                    <!-- Mobile maps side by side -->
                    <div class="flex flex-row gap-2 mt-2">
                        <div v-for="i in 2" :key="'map3-mobile-' + i + '-' + zoomLevel3"
                            class="overflow-hidden relative" style="width: 180px; height: 320px;">
                            <WorldMap :isInteractive="false" :countryToHighlight="selectedCountry" :highlightColor="'#3b82f6'"
                                :zoomLevel="zoomLevel3" :targetCountry="selectedCountry" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
