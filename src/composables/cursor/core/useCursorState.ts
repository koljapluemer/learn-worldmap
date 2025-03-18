import { ref, onMounted, onUnmounted } from 'vue'
import type { Point } from '../geometry/calculations'
import { constrainPointToRectangle } from '../geometry/calculations'

export interface CursorState {
  element: HTMLElement | null
  isTouchDevice: boolean
  isVisible: boolean
  isDragging: boolean
}

export function useCursorState(size: number = 76) {
  const state = ref<CursorState>({
    element: null,
    isTouchDevice: false,
    isVisible: false,
    isDragging: false
  })
  const containerRef = ref<HTMLElement | null>(null)

  const updateCursorVisibility = (isVisible: boolean): void => {
    document.body.classList.toggle('hovering-map', isVisible)
  }

  const createCursorElement = (size: number): HTMLElement => {
    const cursor = document.createElement('div')
    cursor.className = 'custom-cursor'
    document.body.appendChild(cursor)
    return cursor
  }

  const initializeCursorPosition = () => {
    if (!state.value.element || !containerRef.value) return

    const rect = containerRef.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    updateCursorPosition({
      x: centerX,
      y: centerY
    })
  }

  const updateCursorPosition = (position: Point): void => {
    if (!state.value.element || !containerRef.value) return

    const rect = containerRef.value.getBoundingClientRect()
    const cursorRadius = size / 2

    const constrainedPosition = constrainPointToRectangle(position, rect, cursorRadius)
    state.value.element.style.left = `${constrainedPosition.x}px`
    state.value.element.style.top = `${constrainedPosition.y}px`
  }

  onMounted(() => {
    if (!containerRef.value) return

    state.value.isTouchDevice = 'ontouchstart' in window
    state.value.element = createCursorElement(size)

    // Initialize cursor position
    initializeCursorPosition()

    // Add resize handler to reposition cursor if needed
    window.addEventListener('resize', initializeCursorPosition)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', initializeCursorPosition)

    if (state.value.element?.parentNode) {
      state.value.element.parentNode.removeChild(state.value.element)
    }
  })

  return {
    state,
    containerRef,
    updateCursorVisibility,
    updateCursorPosition,
    initializeCursorPosition
  }
} 