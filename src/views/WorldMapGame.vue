<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { useSpacedRepetition } from '../composables/useSpacedRepetition'

interface TouchEventWithTouches extends Event {
  touches: Touch[];
  preventDefault: () => void;
}

interface PointerPosition {
  clientX: number;
  clientY: number;
}

const mapContainer = ref<HTMLElement | null>(null)
const cursor = ref<HTMLElement | null>(null)
const isTouchDevice = ref(false)
const isHoveringMap = ref(false)
const { createOrUpdateCard } = useSpacedRepetition()

// Custom cursor size (20mm at 96 DPI for better touch targets)
const CURSOR_SIZE = 76 // pixels

// Track pointer position (mouse or touch)
const updateCursorPosition = (e: PointerPosition) => {
  if (!cursor.value) {
    cursor.value = document.createElement('div')
    cursor.value.className = 'custom-cursor'
    document.body.appendChild(cursor.value)
  }

  cursor.value.style.left = `${e.clientX}px`
  cursor.value.style.top = `${e.clientY}px`
}

// Handle mouse movement
const handleMouseMove = (e: MouseEvent) => {
  if (isHoveringMap.value) {
    updateCursorPosition({ clientX: e.clientX, clientY: e.clientY })
  }
}

// Handle map hover
const handleMapEnter = () => {
  isHoveringMap.value = true
  document.body.classList.add('hovering-map')
}

const handleMapLeave = () => {
  isHoveringMap.value = false
  document.body.classList.remove('hovering-map')
}

// Handle touch events
const handleTouchStart = (e: Event) => {
  const touchEvent = e as TouchEventWithTouches
  if (!('touches' in touchEvent) || touchEvent.touches.length === 0) return
  touchEvent.preventDefault()
  isTouchDevice.value = true
  isHoveringMap.value = true
  document.body.classList.add('hovering-map')
  const touch = touchEvent.touches[0]
  updateCursorPosition({ clientX: touch.clientX, clientY: touch.clientY })
}

const handleTouchMove = (e: Event) => {
  const touchEvent = e as TouchEventWithTouches
  if (!('touches' in touchEvent) || touchEvent.touches.length === 0) return
  const touch = touchEvent.touches[0]
  updateCursorPosition({ clientX: touch.clientX, clientY: touch.clientY })
}

const handleTouchEnd = () => {
  isHoveringMap.value = false
  document.body.classList.remove('hovering-map')
}

// Check if cursor overlaps with a country
const isCursorOverlappingElement = (element: SVGPathElement, cursorX: number, cursorY: number): boolean => {
  const rect = element.getBoundingClientRect()
  const cursorRadius = CURSOR_SIZE / 2

  // Calculate the closest point on the rectangle to the cursor center
  const closestX = Math.max(rect.left, Math.min(cursorX, rect.right))
  const closestY = Math.max(rect.top, Math.min(cursorY, rect.bottom))

  // Calculate distance between cursor center and closest point
  const dx = cursorX - closestX
  const dy = cursorY - closestY
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Return true if the distance is less than the cursor radius
  return distance <= cursorRadius
}

onMounted(async () => {
  if (!mapContainer.value) return
  
  // Check if device supports touch
  isTouchDevice.value = 'ontouchstart' in window

  // Add pointer event listeners
  if (!isTouchDevice.value) {
    document.addEventListener('mousemove', handleMouseMove)
    mapContainer.value.addEventListener('mouseenter', handleMapEnter)
    mapContainer.value.addEventListener('mouseleave', handleMapLeave)
  }
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)

  // Load world map data
  const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
  const data = await response.json()

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
    .attr('class', 'country')

  // Highlight France
  svg.selectAll('path')
    .filter((d: any) => d.properties.name === 'France')
    .attr('fill', '#ff6b6b')
    .attr('class', 'france')

  // Add click/touch handler
  svg.selectAll('path')
    .on('click touchend', (event: Event, d: any) => {
      event.preventDefault()
      if (!cursor.value) return

      const cursorX = parseFloat(cursor.value.style.left)
      const cursorY = parseFloat(cursor.value.style.top)
      const target = event.target as SVGPathElement
      const isFrance = target.classList.contains('france')
      
      // Check if any part of the cursor overlaps with France
      const franceElement = document.querySelector('.france') as SVGPathElement
      if (franceElement && isCursorOverlappingElement(franceElement, cursorX, cursorY)) {
        createOrUpdateCard({
          question: 'Where is France?',
          answer: 'France is a country in Western Europe',
          tags: ['geography', 'countries', 'europe']
        })
        alert('Correct! France has been added to your spaced repetition deck.')
      } else {
        alert('Try again! Click on France.')
      }
    })
})

onUnmounted(() => {
  if (!isTouchDevice.value && mapContainer.value) {
    document.removeEventListener('mousemove', handleMouseMove)
    mapContainer.value.removeEventListener('mouseenter', handleMapEnter)
    mapContainer.value.removeEventListener('mouseleave', handleMapLeave)
  }
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  if (cursor.value && cursor.value.parentNode) {
    cursor.value.parentNode.removeChild(cursor.value)
  }
})
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Find France on the Map</h1>
    <div ref="mapContainer" class="w-full h-[600px] border rounded-lg touch-none"></div>
  </div>
</template>

<style>
/* Global styles for cursor visibility */
body.hovering-map {
  cursor: none;
}

.custom-cursor {
  width: 76px;
  height: 76px;
  background: rgba(255, 107, 107, 0.2);
  border: 2px solid #ff6b6b;
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

.custom-cursor::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #ff6b6b;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

@media (hover: none) {
  .custom-cursor {
    display: none;
  }
}
</style>

<style scoped>
.country {
  transition: fill 0.3s ease;
}

.country:hover {
  fill: #e2e8f0;
}

.france:hover {
  fill: #ff8787 !important;
}
</style> 