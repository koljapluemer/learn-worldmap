import { ref, onMounted, onUnmounted } from 'vue'

interface PointerPosition {
  clientX: number
  clientY: number
}

interface TouchEventWithTouches extends Event {
  touches: Touch[]
  preventDefault: () => void
}

export function useCustomCursor(size: number = 76) {
  const cursor = ref<HTMLElement | null>(null)
  const isTouchDevice = ref(false)
  const isVisible = ref(false)
  const containerRef = ref<HTMLElement | null>(null)
  const isDragging = ref(false)

  const updateCursorPosition = (e: PointerPosition) => {
    if (!cursor.value) {
      cursor.value = document.createElement('div')
      cursor.value.className = 'custom-cursor'
      document.body.appendChild(cursor.value)
    }

    cursor.value.style.left = `${e.clientX}px`
    cursor.value.style.top = `${e.clientY}px`
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isVisible.value) {
      updateCursorPosition({ clientX: e.clientX, clientY: e.clientY })
    }
  }

  const handleContainerEnter = () => {
    isVisible.value = true
    document.body.classList.add('hovering-map')
  }

  const handleContainerLeave = () => {
    isVisible.value = false
    document.body.classList.remove('hovering-map')
  }

  const handleTouchStart = (e: Event) => {
    const touchEvent = e as TouchEventWithTouches
    if (!('touches' in touchEvent) || touchEvent.touches.length === 0) return
    
    const touch = touchEvent.touches[0]
    const cursorElement = cursor.value
    
    if (cursorElement) {
      const rect = cursorElement.getBoundingClientRect()
      const cursorCenterX = rect.left + rect.width / 2
      const cursorCenterY = rect.top + rect.height / 2
      
      // Check if touch is within the cursor's radius
      const dx = touch.clientX - cursorCenterX
      const dy = touch.clientY - cursorCenterY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance <= size / 2) {
        // User touched the cursor - start dragging
        isDragging.value = true
        touchEvent.preventDefault()
        isTouchDevice.value = true
        isVisible.value = true
        document.body.classList.add('hovering-map')
        updateCursorPosition({ clientX: touch.clientX, clientY: touch.clientY })
      }
    }
  }

  const handleTouchMove = (e: Event) => {
    if (!isDragging.value) return
    
    const touchEvent = e as TouchEventWithTouches
    if (!('touches' in touchEvent) || touchEvent.touches.length === 0) return
    const touch = touchEvent.touches[0]
    updateCursorPosition({ clientX: touch.clientX, clientY: touch.clientY })
  }

  const handleTouchEnd = (e: Event) => {
    console.log('Touch end detected, isDragging:', isDragging.value)
    if (isDragging.value) {
      // Get the current cursor position
      const cursorElement = cursor.value
      if (!cursorElement) {
        console.log('No cursor element found')
        return
      }

      const rect = cursorElement.getBoundingClientRect()
      const cursorX = rect.left + rect.width / 2
      const cursorY = rect.top + rect.height / 2
      console.log('Cursor position:', { x: cursorX, y: cursorY })

      // Find all countries that the cursor overlaps with
      const touchedCountries: string[] = []
      const countryElements = containerRef.value?.querySelectorAll('path')
      
      if (countryElements) {
        console.log('Found country elements:', countryElements.length)
        countryElements.forEach(element => {
          if (isCursorOverlappingElement(element, cursorX, cursorY, 1.2)) {
            const countryName = element.getAttribute('data-country')
            if (countryName) {
              touchedCountries.push(countryName)
              console.log('Found overlapping country:', countryName)
            }
          }
        })
      } else {
        console.log('No country elements found')
      }

      // Emit the click event with touched countries
      if (touchedCountries.length > 0) {
        console.log('Dispatching mapClicked event with countries:', touchedCountries)
        // Create a synthetic click event
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: cursorX,
          clientY: cursorY
        })
        containerRef.value?.dispatchEvent(clickEvent)
      } else {
        console.log('No countries touched, not dispatching event')
      }

      isDragging.value = false
      isVisible.value = false
      document.body.classList.remove('hovering-map')
      console.log('Reset dragging state')
    }
  }

  const isCursorOverlappingElement = (
    element: Element, 
    cursorX: number, 
    cursorY: number,
    detectionRadiusMultiplier: number = 1
  ): boolean => {
    const rect = element.getBoundingClientRect()
    const cursorRadius = (size / 2) * detectionRadiusMultiplier

    // Calculate the closest point on the rectangle to the cursor center
    const closestX = Math.max(rect.left, Math.min(cursorX, rect.right))
    const closestY = Math.max(rect.top, Math.min(cursorY, rect.bottom))

    // Calculate distance between cursor center and closest point
    const dx = cursorX - closestX
    const dy = cursorY - closestY
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance <= cursorRadius
  }

  onMounted(() => {
    if (!containerRef.value) return

    // Check if device supports touch
    isTouchDevice.value = 'ontouchstart' in window

    // Create and initialize cursor element
    cursor.value = document.createElement('div')
    cursor.value.className = 'custom-cursor'
    document.body.appendChild(cursor.value)

    // Position cursor initially
    if (isTouchDevice.value) {
      // On mobile, position in center of screen
      cursor.value.style.left = '50%'
      cursor.value.style.top = '50%'
    } else {
      // On desktop, position at mouse position
      cursor.value.style.left = '0'
      cursor.value.style.top = '0'
    }

    // Add pointer event listeners
    if (!isTouchDevice.value) {
      document.addEventListener('mousemove', handleMouseMove)
      containerRef.value.addEventListener('mouseenter', handleContainerEnter)
      containerRef.value.addEventListener('mouseleave', handleContainerLeave)
    }
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    // Add cursor styles
    const style = document.createElement('style')
    style.textContent = `
      body.hovering-map { cursor: none; }
      .custom-cursor {
        width: ${size}px;
        height: ${size}px;
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
      @media (hover: none) {
        body.hovering-map {
          cursor: auto;
        }
        .custom-cursor {
          display: block !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      }
    `
    document.head.appendChild(style)
  })

  onUnmounted(() => {
    if (!isTouchDevice.value && containerRef.value) {
      document.removeEventListener('mousemove', handleMouseMove)
      containerRef.value.removeEventListener('mouseenter', handleContainerEnter)
      containerRef.value.removeEventListener('mouseleave', handleContainerLeave)
    }
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    if (cursor.value && cursor.value.parentNode) {
      cursor.value.parentNode.removeChild(cursor.value)
    }
  })

  return {
    containerRef,
    cursor,
    isTouchDevice,
    isVisible,
    isDragging,
    isCursorOverlappingElement
  }
} 