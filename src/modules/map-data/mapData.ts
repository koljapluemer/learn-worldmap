import { ref } from 'vue'
import worldGeoJson from './woldmap.geo.json'
import type { GeoJSONData } from './types'

// Shared state for available countries
export const availableCountries = ref<string[]>([])

// Function to load map data and initialize available countries
export async function loadMapData(): Promise<GeoJSONData> {
  try {
    const data = worldGeoJson as GeoJSONData
    availableCountries.value = data.features.map(f => f.properties.name)
    return data
  } catch (error) {
    console.error('Failed to load map data:', error)
    throw error
  }
}

// Function to get GeoJSON data for map rendering
export async function getMapData(): Promise<GeoJSONData> {
  return await loadMapData()
} 