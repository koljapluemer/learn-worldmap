import { useCursorState } from './core/useCursorState'
import { useCursorStyles } from './core/useCursorStyles'
import { useMouseEvents } from './interaction/useMouseEvents'
import { useTouchEvents } from './interaction/useTouchEvents'
import { useCountryDetection } from './map/useCountryDetection'

export function useCustomCursor(size: number = 76) {
  const {
    state,
    containerRef,
    updateCursorVisibility,
    updateCursorPosition,
    initializeCursorPosition
  } = useCursorState(size)

  const { applyCursorStyles } = useCursorStyles(size)
  const { handleInteractionEnd, findTouchedCountries } = useCountryDetection(size)

  // Initialize styles
  applyCursorStyles()

  // Set up mouse events
  useMouseEvents({
    state: state.value,
    containerRef: containerRef.value,
    updateCursorVisibility,
    updateCursorPosition
  })

  // Set up touch events
  useTouchEvents({
    state: state.value,
    containerRef: containerRef.value,
    updateCursorVisibility,
    updateCursorPosition,
    onTouchEnd: handleInteractionEnd
  })

  return {
    containerRef,
    cursor: state.value.element,
    isTouchDevice: state.value.isTouchDevice,
    isVisible: state.value.isVisible,
    isDragging: state.value.isDragging,
    initializeCursorPosition,
    findTouchedCountries,
    isCursorOverlappingElement: (element: Element, cursorX: number, cursorY: number) =>
      findTouchedCountries(containerRef.value, cursorX, cursorY, size).length > 0
  }
} 