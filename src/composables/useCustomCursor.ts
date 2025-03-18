import { ref, onMounted, onUnmounted } from 'vue'

interface PointerPosition {
  clientX: number
  clientY: number
}

interface TouchEventWithTouches extends Event {
  touches: Touch[]
  preventDefault: () => void
}

interface CursorState {
  element: HTMLElement | null
  isTouchDevice: boolean
  isVisible: boolean
  isDragging: boolean
}

// Pure functions for calculations
const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x1 - x2
  const dy = y1 - y2
  return Math.sqrt(dx * dx + dy * dy)
}

const getClosestPointOnRectangle = (
  rect: DOMRect,
  pointX: number,
  pointY: number
): { x: number; y: number } => ({
  x: Math.max(rect.left, Math.min(pointX, rect.right)),
  y: Math.max(rect.top, Math.min(pointY, rect.bottom))
})

const isPointInCircle = (
  pointX: number,
  pointY: number,
  centerX: number,
  centerY: number,
  radius: number
): boolean => {
  const distance = calculateDistance(pointX, pointY, centerX, centerY)
  return distance <= radius
}

const getElementCenter = (element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

// DOM manipulation functions
const createCursorElement = (size: number): HTMLElement => {
  const cursor = document.createElement('div')
  cursor.className = 'custom-cursor'
  document.body.appendChild(cursor)
  return cursor
}

const createCursorStyles = (size: number): string => `
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

const applyCursorStyles = (size: number): void => {
  const style = document.createElement('style')
  style.textContent = createCursorStyles(size)
  document.head.appendChild(style)
}

// Cursor state management
const updateCursorVisibility = (isVisible: boolean): void => {
  document.body.classList.toggle('hovering-map', isVisible)
}

const updateCursorPosition = (cursor: HTMLElement, position: PointerPosition): void => {
  cursor.style.left = `${position.clientX}px`
  cursor.style.top = `${position.clientY}px`
}

// Touch handling functions
const getTouchFromEvent = (e: Event): Touch | null => {
  const touchEvent = e as TouchEventWithTouches
  return ('touches' in touchEvent && touchEvent.touches.length > 0) ? touchEvent.touches[0] : null
}

const isTouchOnCursor = (
  touch: Touch,
  cursor: HTMLElement,
  size: number
): boolean => {
  const rect = cursor.getBoundingClientRect()
  const cursorCenterX = rect.left + rect.width / 2
  const cursorCenterY = rect.top + rect.height / 2
  
  return isPointInCircle(
    touch.clientX,
    touch.clientY,
    cursorCenterX,
    cursorCenterY,
    size / 2
  )
}

const findTouchedCountries = (
  container: HTMLElement | null,
  cursorX: number,
  cursorY: number,
  size: number,
  detectionRadiusMultiplier: number = 1
): string[] => {
  if (!container) return []
  
  const touchedCountries: string[] = []
  const countryElements = container.querySelectorAll('path')
  const cursorRadius = (size / 2) * detectionRadiusMultiplier

  countryElements.forEach(element => {
    const rect = element.getBoundingClientRect()
    const { x: closestX, y: closestY } = getClosestPointOnRectangle(rect, cursorX, cursorY)
    const distance = calculateDistance(cursorX, cursorY, closestX, closestY)

    if (distance <= cursorRadius) {
      const countryName = element.getAttribute('data-country')
      if (countryName) touchedCountries.push(countryName)
    }
  })

  return touchedCountries
}

const dispatchMapClickEvent = (
  container: HTMLElement | null,
  cursorX: number,
  cursorY: number
): void => {
  if (!container) return

  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: cursorX,
    clientY: cursorY
  })
  container.dispatchEvent(clickEvent)
}

export function useCustomCursor(size: number = 76) {
  const state = ref<CursorState>({
    element: null,
    isTouchDevice: false,
    isVisible: false,
    isDragging: false
  })
  const containerRef = ref<HTMLElement | null>(null)

  const handleMouseMove = (e: MouseEvent) => {
    if (state.value.isVisible && state.value.element) {
      updateCursorPosition(state.value.element, {
        clientX: e.clientX,
        clientY: e.clientY
      })
    }
  }

  const handleContainerEnter = () => {
    state.value.isVisible = true
    updateCursorVisibility(true)
  }

  const handleContainerLeave = () => {
    state.value.isVisible = false
    updateCursorVisibility(false)
  }

  const handleTouchStart = (e: Event) => {
    const touch = getTouchFromEvent(e)
    if (!touch || !state.value.element) return

    if (isTouchOnCursor(touch, state.value.element, size)) {
      state.value.isDragging = true
      state.value.isTouchDevice = true
      state.value.isVisible = true
      updateCursorVisibility(true)
      updateCursorPosition(state.value.element, {
        clientX: touch.clientX,
        clientY: touch.clientY
      })
      ;(e as TouchEventWithTouches).preventDefault()
    }
  }

  const handleTouchMove = (e: Event) => {
    if (!state.value.isDragging || !state.value.element) return
    
    const touch = getTouchFromEvent(e)
    if (!touch) return

    updateCursorPosition(state.value.element, {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
  }

  const handleTouchEnd = (e: Event) => {
    if (!state.value.isDragging || !state.value.element) return

    const { x: cursorX, y: cursorY } = getElementCenter(state.value.element)

    const touchedCountries = findTouchedCountries(
      containerRef.value,
      cursorX,
      cursorY,
      size
    )

    if (touchedCountries.length > 0) {
      dispatchMapClickEvent(containerRef.value, cursorX, cursorY)
    }

    state.value.isDragging = false
    state.value.isVisible = false
    updateCursorVisibility(false)
  }

  onMounted(() => {
    if (!containerRef.value) return

    state.value.isTouchDevice = 'ontouchstart' in window
    state.value.element = createCursorElement(size)
    applyCursorStyles(size)

    if (!state.value.isTouchDevice) {
      document.addEventListener('mousemove', handleMouseMove)
      containerRef.value.addEventListener('mouseenter', handleContainerEnter)
      containerRef.value.addEventListener('mouseleave', handleContainerLeave)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  })

  onUnmounted(() => {
    if (!state.value.isTouchDevice && containerRef.value) {
      document.removeEventListener('mousemove', handleMouseMove)
      containerRef.value.removeEventListener('mouseenter', handleContainerEnter)
      containerRef.value.removeEventListener('mouseleave', handleContainerLeave)
    }

    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)

    if (state.value.element?.parentNode) {
      state.value.element.parentNode.removeChild(state.value.element)
    }
  })

  return {
    containerRef,
    cursor: state.value.element,
    isTouchDevice: state.value.isTouchDevice,
    isVisible: state.value.isVisible,
    isDragging: state.value.isDragging,
    isCursorOverlappingElement: (element: Element, cursorX: number, cursorY: number) =>
      findTouchedCountries(containerRef.value, cursorX, cursorY, size).length > 0
  }
} 