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
}>()

console.log('[WorldMap] mounted with zoomLevel:', props.zoomLevel)

watch(() => props.zoomLevel, (newVal, oldVal) => {
  console.log('[WorldMap] zoomLevel prop changed from', oldVal, 'to', newVal)
})

const emit = defineEmits<{
  (e: 'mapClicked', touchedCountries: string[], distanceToTarget?: number): void
}>()

const { containerRef, findTouchedCountries } = useCustomCursor(76, props.isInteractive ? emit : undefined)
const highlightCircles = ref<SVGCircleElement[]>([])
const svg = ref<d3.Selection<SVGSVGElement, unknown, null, undefined>>()
const mapData = ref<FeatureCollection>(rawMapData as FeatureCollection)
const projection = ref<d3.GeoProjection>()

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

const handleMapClick = (event: Event) => {
  if (!props.isInteractive) return
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

  event.preventDefault()
  event.stopPropagation()
  
  if (!(event instanceof MouseEvent)) return

  const distance = calculateDistanceToCountryCenter(event.clientX, event.clientY)
  const touchedCountries = findTouchedCountries(containerRef.value, event.clientX, event.clientY)
  emit('mapClicked', touchedCountries, distance)
}

const updateMapTransform = () => {
  console.log('[WorldMap] updateMapTransform called with zoomLevel:', props.zoomLevel)
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
      console.log('zoomLevel', props.zoomLevel)
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
        
        const cellX = Math.floor(Math.random() * gridSize)
        const cellY = Math.floor(Math.random() * gridSize)
        
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
  svg.value
    .selectAll('path')
    .attr('d', path as any)

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

watch(() => props.countryToHighlight, (newCountry) => {
  if (!containerRef.value || !projection.value || !mapData.value) return

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

  if (props.isInteractive && !('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    containerRef.value.addEventListener('click', handleMapClick)
  }

  if (props.isInteractive) {
    containerRef.value.classList.add('cursor-tracking')
  }

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  if (containerRef.value) {
    containerRef.value.removeEventListener('click', handleMapClick)
  }
  
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
  fill: #3b82f6;
  stroke: #2563eb;
}

.highlight-circle {
  pointer-events: none;
  stroke-dasharray: 4;
  animation: rotate 20s linear infinite;
}
</style> 