import { onMounted, onUnmounted } from 'vue'
import type { CursorState } from '../core/useCursorState'
import type { Point } from '../geometry/calculations'

interface TouchEventWithTouches extends Event {
  touches: Touch[]
  preventDefault: () => void
}

interface TouchEventsProps {
  state: CursorState
  containerRef: HTMLElement | null
  updateCursorVisibility: (isVisible: boolean) => void
  updateCursorPosition: (position: Point) => void
  onTouchEnd: (position: Point) => void
}

const getTouchFromEvent = (e: Event): Touch | null => {
  const touchEvent = e as TouchEventWithTouches
  return ('touches' in touchEvent && touchEvent.touches.length > 0) ? touchEvent.touches[0] : null
}

export function useTouchEvents({
  state,
  containerRef,
  updateCursorVisibility,
  updateCursorPosition,
  onTouchEnd
}: TouchEventsProps) {
  const handleTouchStart = (e: Event) => {
    const touch = getTouchFromEvent(e)
    if (!touch || !state.element || !containerRef) return

    const rect = containerRef.getBoundingClientRect()

    // Only handle touch events that start within the map boundaries
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      state.isDragging = true
      state.isVisible = true
      updateCursorVisibility(true)
      updateCursorPosition({
        x: touch.clientX,
        y: touch.clientY
      })
      ;(e as TouchEventWithTouches).preventDefault()
    }
  }

  const handleTouchMove = (e: Event) => {
    if (!state.isDragging || !state.element) return
    
    const touch = getTouchFromEvent(e)
    if (!touch) return

    updateCursorPosition({
      x: touch.clientX,
      y: touch.clientY
    })
  }

  const handleTouchEnd = (e: Event) => {
    if (!state.isDragging || !state.element) return

    const touch = getTouchFromEvent(e)
    if (!touch) return

    onTouchEnd({
      x: touch.clientX,
      y: touch.clientY
    })

    state.isDragging = false
    state.isVisible = false
    updateCursorVisibility(false)
  }

  onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  })
} 