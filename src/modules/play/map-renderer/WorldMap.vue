<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import { useCustomCursor } from './useCustomCursor';
import { getMapData } from '@/modules/map-data/mapData';

const props = defineProps<{
  countryToHighlight?: string
  highlightColor?: string
  useCircleAroundHighlight?: boolean
  zoomLevel?: number
  targetCountry?: string
}>()

const emit = defineEmits<{
  (e: 'mapClicked', touchedCountries: string[], distanceToTarget?: number): void
}>()

const { containerRef, findTouchedCountries } = useCustomCursor(76)
const highlightCircles = ref<SVGCircleElement[]>([])
const svg = ref<d3.Selection<SVGSVGElement, unknown, null, undefined>>()
const mapData = ref<any>(null)
const projection = ref<d3.GeoProjection>()

const calculateDistanceToCountryCenter = (clickX: number, clickY: number): number => {
  if (!props.targetCountry || !projection.value || !mapData.value) return 0

  // Find target country feature
  const targetFeature = mapData.value.features.find(
    (f: any) => f.properties.name === props.targetCountry
  )
  if (!targetFeature) return 0

  // Get target country centroid coordinates
  const targetCentroid = d3.geoCentroid(targetFeature)

  // Convert screen coordinates back to [longitude, latitude]
  const svgRect = containerRef.value?.getBoundingClientRect()
  if (!svgRect) return 0
  
  const relativeClickX = clickX - svgRect.left
  const relativeClickY = clickY - svgRect.top
  
  // Invert the projection to get geographic coordinates of the click
  const clickCoords = projection.value.invert?.([relativeClickX, relativeClickY])
  if (!clickCoords) return 0

  // Calculate great-circle distance in kilometers
  // Using the Haversine formula
  const [lon1, lat1] = clickCoords
  const [lon2, lat2] = targetCentroid
  
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c

  return distance
}

const handleMapClick = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  
  let cursorX: number
  let cursorY: number

  if (event instanceof MouseEvent) {
    cursorX = event.clientX
    cursorY = event.clientY
  } else if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    // Handle both touchstart and touchend events
    const touch = event.type === 'touchend' ? event.changedTouches[0] : event.touches[0]
    if (!touch) return
    cursorX = touch.clientX
    cursorY = touch.clientY
  } else {
    return // Invalid event type
  }

  // Calculate distance to target country center
  const distance = calculateDistanceToCountryCenter(cursorX, cursorY)

  // Find all countries that the cursor overlaps with using the precise detection
  const touchedCountries = findTouchedCountries(containerRef.value, cursorX, cursorY, 76)

  emit('mapClicked', touchedCountries, distance)
}

const updateMapTransform = () => {
  if (!svg.value || !mapData.value || !containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  // Get the base (world) projection and scale
  const worldProjection = d3.geoMercator().fitSize([width, height], mapData.value)
  const worldScale = worldProjection.scale()
  
  // Create our working projection
  projection.value = d3.geoMercator()
  
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
        
        projection.value
          .center(centroid)
          .scale(currentScale)
          .translate([targetX, targetY])
      } else {
        // At world view, use standard projection
        projection.value.fitSize([width, height], mapData.value)
      }
    } else {
      projection.value.fitSize([width, height], mapData.value)
    }
  } else {
    projection.value.fitSize([width, height], mapData.value)
  }

  // Update the paths with the new projection
  const path = d3.geoPath().projection(projection.value)
  svg.value
    .selectAll('path')
    .attr('d', path as any)

  // Update circle positions if they exist
  if (props.countryToHighlight) {
    const countryFeature = mapData.value.features.find(
      (f: any) => f.properties.name === props.countryToHighlight
    )
    if (countryFeature) {
      const centroid = path.centroid(countryFeature)
      highlightCircles.value.forEach(circle => {
        d3.select(circle)
          .attr('cx', centroid[0])
          .attr('cy', centroid[1])
      })
    }
  }
}

// Update highlighting when props change
watch(() => props.countryToHighlight, (newCountry) => {
  if (!containerRef.value || !projection.value || !mapData.value) return

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
      const countryFeature = mapData.value.features.find(
        (f: any) => f.properties.name === newCountry
      )
      if (countryFeature) {
        const path = d3.geoPath().projection(projection.value)
        const centroid = path.centroid(countryFeature)
        
        const svg = d3.select(containerRef.value).select('svg')
        const circle = svg.append('circle')
          .attr('cx', centroid[0])
          .attr('cy', centroid[1])
          .attr('r', 38)
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

const handleResize = () => {
  if (!containerRef.value || !svg.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  // Update SVG dimensions
  svg.value
    .attr('width', width)
    .attr('height', height)

  // Update map projection and redraw
  updateMapTransform()
}

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
    .attr('fill', '#e0f2fe')  // Washed out blue
    .attr('stroke', '#38bdf8')  // Splashy blue
    .attr('stroke-width', 0.5)
    .attr('class', 'country')
    .attr('data-country', (d: any) => d.properties.name)

  // Add click and touch handlers
  containerRef.value.addEventListener('click', handleMapClick)
  containerRef.value.addEventListener('touchstart', handleMapClick, { passive: false })
  containerRef.value.addEventListener('touchend', handleMapClick)

  // Enable cursor tracking
  containerRef.value.classList.add('cursor-tracking')

  // Add resize listener
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // Clean up resize listener
  window.removeEventListener('resize', handleResize)
  
  // Clean up click handlers if containerRef still exists
  if (containerRef.value) {
    containerRef.value.removeEventListener('click', handleMapClick)
    containerRef.value.removeEventListener('touchstart', handleMapClick)
    containerRef.value.removeEventListener('touchend', handleMapClick)
  }
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
  body.hovering-map {
    cursor: auto;
  }
  .custom-cursor {
    display: none !important;
  }
}
</style>

<style scoped>

.country.highlighted {
  fill: #3b82f6; /* Tailwind blue-500 */
  stroke: #2563eb; /* Tailwind blue-600 */
  stroke-width: 1;
}

.highlight-circle {
  pointer-events: none;
  stroke-dasharray: 4;
  animation: rotate 20s linear infinite;
}


</style> 