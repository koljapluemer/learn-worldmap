<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import { useCustomCursor } from './useCustomCursor'
import rawMapData from '@/modules/map-data/map.geo.json'
import { getMapSettings } from '@/modules/settings-view/defaultSettings'
import type { FeatureCollection } from 'geojson'

const props = defineProps<{
  isInteractive?: boolean
  countryToHighlight?: string
  highlightColor?: string
  useCircleAroundHighlight?: boolean
  zoomLevel?: number
  targetCountry?: string
  panIndex?: number
}>()

const emit = defineEmits<{
  mapClicked: [touchedCountries: string[], distanceToTarget?: number]
  mapReady: []
}>()

const { containerRef, findTouchedCountries } = useCustomCursor(() => {
  if (!props.isInteractive) return
  
  // Get current cursor position from the cursor element
  const cursorElement = document.querySelector('.custom-cursor') as HTMLElement
  if (!cursorElement) return
  
  const rect = cursorElement.getBoundingClientRect()
  const cursorX = rect.left + rect.width / 2
  const cursorY = rect.top + rect.height / 2
  
  const distance = calculateDistanceToCountryCenter(cursorX, cursorY)
  const touchedCountries = findTouchedCountries(containerRef.value, cursorX, cursorY)
  emit('mapClicked', touchedCountries, distance)
})

const highlightCircles = ref<SVGCircleElement[]>([])
const svg = ref<d3.Selection<SVGSVGElement, unknown, null, undefined>>()
const mapData = ref<FeatureCollection>(rawMapData as FeatureCollection)
const projection = ref<d3.GeoProjection>()
const isMapReady = ref(false)

// Get settings from centralized settings
const settings = ref(getMapSettings())
const waterColor = ref(settings.value.waterColor)
const landColor = ref(settings.value.landColor)
const borderColor = ref(settings.value.borderColor)
const borderThickness = ref(settings.value.borderThickness)

// Watch for settings changes
watch([waterColor, landColor, borderColor, borderThickness], () => {
  if (!svg.value) return
  
  // Update all countries with new settings
  svg.value.selectAll('path')
    .attr('fill', landColor.value)
    .attr('stroke', borderColor.value)
    .attr('stroke-width', borderThickness.value)
})

const calculateDistanceToCountryCenter = (clickX: number, clickY: number): number => {
  if (!props.targetCountry || !projection.value || !mapData.value) return 0

  const targetFeature = mapData.value.features.find(
    (f: any) => f.properties.name === props.targetCountry
  )
  if (!targetFeature) return 0

  const targetCentroid = d3.geoCentroid(targetFeature)
  const svgRect = containerRef.value?.getBoundingClientRect()
  if (!svgRect) return 0
  
  const relativeClickX = clickX - svgRect.left
  const relativeClickY = clickY - svgRect.top
  
  const clickCoords = projection.value.invert?.([relativeClickX, relativeClickY])
  if (!clickCoords) return 0

  const [lon1, lat1] = clickCoords
  const [lon2, lat2] = targetCentroid
  
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const updateMapTransform = () => {
  if (!svg.value || !mapData.value || !containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  const worldProjection = d3.geoMercator().fitSize([width, height], mapData.value)
  const worldScale = worldProjection.scale()
  
  projection.value = d3.geoMercator()
  
  if (props.targetCountry) {
    const targetFeature = mapData.value.features.find(
      (f: any) => f.properties.name === props.targetCountry
    )
    
    if (targetFeature) {
      const countryProjection = d3.geoMercator().fitSize([width, height], targetFeature)
      const countryScale = countryProjection.scale()
      const zoomProgress = props.zoomLevel 
        ? Math.min((props.zoomLevel - 100) / 75, 1)
        : 0
      
      const maxZoomScale = worldScale + (countryScale - worldScale) * 0.6
      const currentScale = worldScale + (maxZoomScale - worldScale) * zoomProgress
      const centroid = d3.geoCentroid(targetFeature)
  
      
      if (zoomProgress > 0) {
        const gridSize = 3
        const cellWidth = width / gridSize
        const cellHeight = height / gridSize
        
        const cellIndex = props.panIndex !== undefined ? props.panIndex : Math.floor(Math.random() * 9)
        const cellX = cellIndex % gridSize
        const cellY = Math.floor(cellIndex / gridSize)
        
        const targetX = cellX * cellWidth + cellWidth / 2
        const targetY = cellY * cellHeight + cellHeight / 2
        
        
        projection.value
          .center(centroid)
          .scale(currentScale)
          .translate([targetX, targetY])
      } else {
        projection.value.fitSize([width, height], mapData.value)
      }
    } else {
      projection.value.fitSize([width, height], mapData.value)
    }
  } else {
    projection.value.fitSize([width, height], mapData.value)
  }

  const path = d3.geoPath().projection(projection.value)
  // Remove all existing paths and re-create them with the new projection
  svg.value.selectAll('path').remove();
  svg.value
    .selectAll('path')
    .data(mapData.value.features)
    .enter()
    .append('path')
    .attr('d', path as any)
    .attr('fill', landColor.value)
    .attr('stroke', borderColor.value)
    .attr('stroke-width', borderThickness.value)
    .attr('class', 'country')
    .attr('data-country', (d: any) => d.properties.name);

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

  // Set map as ready after first transform
  isMapReady.value = true

  if (props.isInteractive) {
    containerRef.value.classList.add('cursor-tracking')
  }

  window.addEventListener('resize', handleResize)
}

watch(() => props.countryToHighlight, (newCountry) => {
  if (!containerRef.value || !projection.value || !mapData.value || !isMapReady.value) return

  d3.select(containerRef.value)
    .selectAll('path')
    .attr('fill', landColor.value)
    .attr('stroke', borderColor.value)
    .attr('stroke-width', borderThickness.value)
    .attr('class', 'country')

  highlightCircles.value.forEach(circle => circle.remove())
  highlightCircles.value = []

  if (newCountry) {
    const countryPath = d3.select(containerRef.value)
      .selectAll('path')
      .filter((d: any) => d.properties.name === newCountry)

    countryPath
      .attr('fill', props.highlightColor || '#3b82f6')
      .attr('stroke', borderColor.value)
      .attr('stroke-width', borderThickness.value)
      .attr('class', 'country highlighted')

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
          .style('stroke-width', borderThickness.value)
        highlightCircles.value.push(circle.node() as SVGCircleElement)
      }
    }
  }
}, { immediate: true })

// Add a watch for map readiness
watch(isMapReady, (ready) => {
  if (ready) {
    emit('mapReady')
  }
})

watch([() => props.zoomLevel, () => props.targetCountry], () => {
  updateMapTransform()
})

watch(() => props.highlightColor, (newColor) => {
  if (!containerRef.value || !newColor) return

  if (props.countryToHighlight) {
    d3.select(containerRef.value)
      .selectAll('path')
      .filter((d: any) => d.properties.name === props.countryToHighlight)
      .attr('fill', newColor)
  }

  highlightCircles.value.forEach(circle => {
    d3.select(circle).style('stroke', newColor)
  })
})

const handleResize = () => {
  if (!containerRef.value || !svg.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  svg.value
    .attr('width', width)
    .attr('height', height)

  updateMapTransform()
}

onMounted(() => {
  if (!containerRef.value) return

  if (props.isInteractive) {
    document.body.classList.add('hovering-map')
  }
  
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  svg.value = d3.select(containerRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('position', 'absolute')
    .style('top', '0')
    .style('left', '0')

  updateMapTransform()

  const path = d3.geoPath().projection(d3.geoMercator().fitSize([width, height], mapData.value))

  svg.value.selectAll('path')
    .data(mapData.value.features)
    .enter()
    .append('path')
    .attr('d', (d: any) => {
      const dVal = path(d)
      if (!dVal) {
        console.error('Path generation failed for feature:', d)
      }
      return dVal
    })
    .attr('fill', landColor.value)
    .attr('stroke', borderColor.value)
    .attr('stroke-width', borderThickness.value)
    .attr('class', 'country')
    .attr('data-country', (d: any) => d.properties.name)

  if (props.isInteractive) {
    containerRef.value.classList.add('cursor-tracking')
  }

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  if (props.isInteractive) {
    document.body.classList.remove('hovering-map')
  }
})
</script>

<template>
  <div 
    ref="containerRef" 
    class="w-full h-full"
    :style="{ backgroundColor: waterColor }"
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
</style>

<style scoped>
.country.highlighted {
  fill: #3b82f6;
  stroke: #2563eb;
}

.highlight-circle {
  pointer-events: none;
  stroke-dasharray: 4;
  animation: rotate 20s linear infinite;
}
</style> 