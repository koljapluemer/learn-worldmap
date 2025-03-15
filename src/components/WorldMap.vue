<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import * as d3 from 'd3'

const props = defineProps<{
  highlightCountry?: string;
  highlightColor?: string;
}>()

const emit = defineEmits<{
  (e: 'countryClick', country: string): void
  (e: 'mapLoaded', countries: string[]): void
}>()

const mapContainer = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!mapContainer.value) return

  // Load world map data
  const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
  const data = await response.json()

  // Get list of available countries and emit it
  const countries = data.features.map((f: any) => f.properties.name)
  emit('mapLoaded', countries)

  // Set up the SVG
  const width = mapContainer.value.clientWidth
  const height = mapContainer.value.clientHeight
  const svg = d3.select(mapContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // Create a projection
  const projection = d3.geoMercator()
    .fitSize([width, height], data)

  // Create a path generator
  const path = d3.geoPath().projection(projection)

  // Draw the map
  svg.selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path as any)
    .attr('fill', '#ccc')
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.5)
    .attr('class', (d: any) => {
      const countryName = d.properties.name
      return `country ${countryName === props.highlightCountry ? 'highlighted' : ''}`
    })
    .attr('data-country', (d: any) => d.properties.name)

  // Highlight specified country
  if (props.highlightCountry) {
    svg.selectAll('path')
      .filter((d: any) => d.properties.name === props.highlightCountry)
      .attr('fill', props.highlightColor || '#ff6b6b')
      .attr('class', 'country highlighted')
  }

  // Add click handler
  svg.selectAll('path')
    .on('click touchend', (event: Event) => {
      event.preventDefault()
      const target = event.target as SVGPathElement
      const country = target.getAttribute('data-country')
      if (country) {
        emit('countryClick', country)
      }
    })
})
</script>

<template>
  <div ref="mapContainer" class="w-full h-full">
    <slot></slot>
  </div>
</template>

<style scoped>
.country {
  transition: fill 0.3s ease;
}

.country:hover {
  fill: #e2e8f0;
}

.highlighted:hover {
  fill: v-bind('props.highlightColor || "#ff8787"') !important;
}
</style> 