import { onMounted, onUnmounted } from 'vue'
import type { CursorState } from '../core/useCursorState'
import type { Point } from '../geometry/calculations'

interface MouseEventsProps {
  state: CursorState
  containerRef: HTMLElement | null
  updateCursorVisibility: (isVisible: boolean) => void
  updateCursorPosition: (position: Point) => void
}

export function useMouseEvents({
  state,
  containerRef,
  updateCursorVisibility,
  updateCursorPosition
}: MouseEventsProps) {
  const handleMouseMove = (e: MouseEvent) => {
    if (state.isVisible && state.element) {
      updateCursorPosition({
        x: e.clientX,
        y: e.clientY
      })
    }
  }

  const handleContainerEnter = () => {
    state.isVisible = true
    updateCursorVisibility(true)
  }

  const handleContainerLeave = () => {
    state.isVisible = false
    updateCursorVisibility(false)
  }

  onMounted(() => {
    if (!state.isTouchDevice && containerRef) {
      document.addEventListener('mousemove', handleMouseMove)
      containerRef.addEventListener('mouseenter', handleContainerEnter)
      containerRef.addEventListener('mouseleave', handleContainerLeave)
    }
  })

  onUnmounted(() => {
    if (!state.isTouchDevice && containerRef) {
      document.removeEventListener('mousemove', handleMouseMove)
      containerRef.removeEventListener('mouseenter', handleContainerEnter)
      containerRef.removeEventListener('mouseleave', handleContainerLeave)
    }
  })
} 