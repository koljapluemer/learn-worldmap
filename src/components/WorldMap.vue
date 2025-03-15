<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'
import { useCustomCursor } from '../composables/useCustomCursor'
import { getMapData } from '../services/mapData'

const props = defineProps<{
  countryToHighlight?: string
  highlightColor?: string
  useCircleAroundHighlight?: boolean
}>()

const emit = defineEmits<{
  (e: 'mapClicked', touchedCountries: string[]): void
}>()

const { containerRef, cursor, isCursorOverlappingElement } = useCustomCursor(76)
const highlightCircles = ref<SVGCircleElement[]>([])

const handleMapClick = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (!cursor.value) return

  // Get cursor position
  const cursorX = event instanceof MouseEvent ? event.clientX : 
                 (event as TouchEvent).touches?.[0]?.clientX ?? 0
  const cursorY = event instanceof MouseEvent ? event.clientY : 
                 (event as TouchEvent).touches?.[0]?.clientY ?? 0

  // Find all countries that the cursor overlaps with
  const touchedCountries: string[] = []
  const countryElements = containerRef.value?.querySelectorAll('path')
  
  if (countryElements) {
    countryElements.forEach(element => {
      if (isCursorOverlappingElement(element, cursorX, cursorY)) {
        const countryName = element.getAttribute('data-country')
        if (countryName) touchedCountries.push(countryName)
      }
    })
  }

  emit('mapClicked', touchedCountries)
}

// Update highlighting when props change
watch(() => props.countryToHighlight, (newCountry) => {
  if (!containerRef.value) return

  // Reset all countries
  d3.select(containerRef.value)
    .selectAll('path')
    .attr('fill', '#ccc')
    .attr('class', 'country')

  // Remove previous highlight circles
  highlightCircles.value.forEach(circle => circle.remove())
  highlightCircles.value = []

  // Highlight the specified country
  if (newCountry) {
    const countryPath = d3.select(containerRef.value)
      .selectAll('path')
      .filter((d: any) => d.properties.name === newCountry)

    // Highlight the country
    countryPath
      .attr('fill', props.highlightColor || '#3b82f6')
      .attr('class', 'country highlighted')

    // Add circle around the country if requested
    if (props.useCircleAroundHighlight) {
      const bounds = (countryPath.node() as SVGPathElement)?.getBBox()
      if (bounds) {
        const svg = d3.select(containerRef.value).select('svg')
        const circle = svg.append('circle')
          .attr('cx', bounds.x + bounds.width / 2)
          .attr('cy', bounds.y + bounds.height / 2)
          .attr('r', Math.max(bounds.width, bounds.height) / 2 + 20)
          .attr('class', 'highlight-circle')
          .style('stroke', props.highlightColor || '#3b82f6')
          .style('fill', 'none')
          .style('stroke-width', '3')
        highlightCircles.value.push(circle.node() as SVGCircleElement)
      }
    }
  }
}, { immediate: true })

onMounted(async () => {
  if (!containerRef.value) return

  // Initialize cursor immediately
  document.body.classList.add('hovering-map')
  
  // Load world map data
  const data = await getMapData()

  // Set up the SVG
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  const svg = d3.select(containerRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('position', 'absolute')
    .style('top', '0')
    .style('left', '0')

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
    .attr('class', 'country')
    .attr('data-country', (d: any) => d.properties.name)

  // Add click handlers
  containerRef.value.addEventListener('click', handleMapClick)
  containerRef.value.addEventListener('touchend', handleMapClick)

  // Enable cursor tracking
  containerRef.value.classList.add('cursor-tracking')
})
</script>

<template>
  <div 
    ref="containerRef" 
    class="w-full h-full"
    @click="handleMapClick"
    @touchend="handleMapClick"
  >
    <slot></slot>
  </div>
</template>

<style>
/* Global styles for cursor visibility */
body.hovering-map {
  cursor: none !important;
}

.cursor-tracking {
  touch-action: none;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.custom-cursor {
  width: 76px;
  height: 76px;
  background: rgba(59, 130, 246, 0.3);
  border: 2px solid #3b82f6;
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

body.hovering-map .custom-cursor {
  opacity: 1;
}

@media (hover: none) {
  .custom-cursor {
    display: block !important;
    opacity: 0.5;
  }
}
</style>

<style scoped>
.country {
  transition: fill 0.3s ease;
  pointer-events: none;
}

.country:hover {
  fill: #e2e8f0;
}

.highlighted {
  fill: #3b82f6 !important;
  stroke: #3b82f6;
  stroke-width: 1;
}

.highlight-circle {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 2;
  stroke-dasharray: 5,5;
  opacity: 0.8;
  pointer-events: none;
}
</style> 