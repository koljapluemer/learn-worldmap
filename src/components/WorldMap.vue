<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'
import { useCustomCursor } from '../composables/useCustomCursor'
import { getMapData } from '../services/mapData'

const props = defineProps<{
  countryToHighlight?: string
  highlightColor?: string
  useCircleAroundHighlight?: boolean
  zoomLevel?: number
  targetCountry?: string
}>()

const emit = defineEmits<{
  (e: 'mapClicked', touchedCountries: string[]): void
}>()

const { containerRef, cursor, isCursorOverlappingElement } = useCustomCursor(76)
const highlightCircles = ref<SVGCircleElement[]>([])
const svg = ref<d3.Selection<SVGSVGElement, unknown, null, undefined>>()
const mapData = ref<any>(null)

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

const updateMapTransform = () => {
  if (!svg.value || !mapData.value || !containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  // Get the base (world) projection and scale
  const worldProjection = d3.geoMercator().fitSize([width, height], mapData.value)
  const worldScale = worldProjection.scale()
  
  // Create our working projection
  const projection = d3.geoMercator()
  
  if (props.targetCountry) {
    // Find the target country's geometry
    const targetFeature = mapData.value.features.find(
      (f: any) => f.properties.name === props.targetCountry
    )
    
    if (targetFeature) {
      // Get the country-focused projection and scale
      const countryProjection = d3.geoMercator().fitSize([width, height], targetFeature)
      const countryScale = countryProjection.scale()
      
      // Calculate zoom progress (0 = world view, 1 = country view)
      const zoomProgress = props.zoomLevel 
        ? Math.min((props.zoomLevel - 100) / 75, 1) // Full zoom at level 15 (100 + 75)
        : 0
      
      // Reduce the maximum zoom to ensure neighboring countries are visible
      // We only zoom in 60% of the way to the country-specific scale
      const maxZoomScale = worldScale + (countryScale - worldScale) * 0.6
      const currentScale = worldScale + (maxZoomScale - worldScale) * zoomProgress
      
      // Get the country's centroid for positioning
      const centroid = d3.geoCentroid(targetFeature)
      
      // Calculate random position if we're zoomed in
      if (zoomProgress > 0) {
        const gridSize = 3
        const cellWidth = width / gridSize
        const cellHeight = height / gridSize
        
        const cellX = Math.floor(Math.random() * gridSize)
        const cellY = Math.floor(Math.random() * gridSize)
        
        const targetX = cellX * cellWidth + cellWidth / 2
        const targetY = cellY * cellHeight + cellHeight / 2
        
        projection
          .center(centroid)
          .scale(currentScale)
          .translate([targetX, targetY])
      } else {
        // At world view, use standard projection
        projection.fitSize([width, height], mapData.value)
      }
    } else {
      projection.fitSize([width, height], mapData.value)
    }
  } else {
    projection.fitSize([width, height], mapData.value)
  }

  // Update the paths with the new projection
  const path = d3.geoPath().projection(projection)
  svg.value
    .selectAll('path')
    .attr('d', path as any)
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
          .attr('r', 38) // Half of cursor size (76/2)
          .attr('class', 'highlight-circle')
          .style('stroke', props.highlightColor || '#3b82f6')
          .style('fill', 'none')
          .style('stroke-width', '3')
        highlightCircles.value.push(circle.node() as SVGCircleElement)
      }
    }
  }
}, { immediate: true })

// Watch for zoom level or target country changes
watch([() => props.zoomLevel, () => props.targetCountry], () => {
  updateMapTransform()
})

// Watch for highlight color changes
watch(() => props.highlightColor, (newColor) => {
  if (!containerRef.value || !newColor) return

  // Update the country fill color
  if (props.countryToHighlight) {
    d3.select(containerRef.value)
      .selectAll('path')
      .filter((d: any) => d.properties.name === props.countryToHighlight)
      .attr('fill', newColor)
  }

  // Update the circle color
  highlightCircles.value.forEach(circle => {
    d3.select(circle).style('stroke', newColor)
  })
})

onMounted(async () => {
  if (!containerRef.value) return

  // Initialize cursor immediately
  document.body.classList.add('hovering-map')
  
  // Load world map data
  mapData.value = await getMapData()

  // Set up the SVG
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  svg.value = d3.select(containerRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('position', 'absolute')
    .style('top', '0')
    .style('left', '0')

  // Initial map setup
  updateMapTransform()

  // Draw the map
  const path = d3.geoPath().projection(d3.geoMercator().fitSize([width, height], mapData.value))
  svg.value.selectAll('path')
    .data(mapData.value.features)
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