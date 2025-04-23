import { ref } from 'vue'
import worldGeoJson from './woldmap.geo.json'
import type { GeoJSONData, GeoJSONFeature } from './types'

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

// Function to get all available continents
export function getAvailableContinents(): string[] {
  const continents = new Set((worldGeoJson as GeoJSONData).features.map((f: GeoJSONFeature) => f.properties.continent))
  return Array.from(continents)
}

// Function to get countries for a continent
export function getCountriesForContinent(continent: string): string[] {
  return (worldGeoJson as GeoJSONData).features
    .filter((f: GeoJSONFeature) => f.properties.continent === continent)
    .map((f: GeoJSONFeature) => f.properties.name)
}

// Function to get GeoJSON data for map rendering
export async function getMapData(): Promise<GeoJSONData> {
  return await loadMapData()
} 