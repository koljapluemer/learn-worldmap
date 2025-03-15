import { ref } from 'vue'

// Shared state for available countries
export const availableCountries = ref<string[]>([])

// Function to load map data and initialize available countries
export async function loadMapData() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
    const data = await response.json()
    availableCountries.value = data.features.map((f: any) => f.properties.name)
    return data
  } catch (error) {
    console.error('Failed to load map data:', error)
    throw error
  }
}

// Function to get GeoJSON data for map rendering
export async function getMapData() {
  return await loadMapData()
} 