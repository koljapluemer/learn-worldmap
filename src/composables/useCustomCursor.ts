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
    touchEvent.preventDefault()
    isTouchDevice.value = true
    isVisible.value = true
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
    isVisible.value = false
    document.body.classList.remove('hovering-map')
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
    isCursorOverlappingElement
  }
} 