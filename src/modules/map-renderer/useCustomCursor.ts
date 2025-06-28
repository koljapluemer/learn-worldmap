import { ref, onMounted, onUnmounted } from "vue";

interface PointerPosition {
  clientX: number;
  clientY: number;
}

interface TouchEventWithTouches extends Event {
  touches: Touch[];
  preventDefault: () => void;
}

interface CursorState {
  element: HTMLElement | null;
  isTouchDevice: boolean;
  isVisible: boolean;
  isDragging: boolean;
  touchStartPosition: PointerPosition | null;
}

// Configuration constants
const MOUSE_CURSOR_SIZE = 1125;
const TOUCH_CURSOR_SIZE = 35;

// Pure functions for calculations
const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
};

const getClosestPointOnRectangle = (
  rect: DOMRect,
  pointX: number,
  pointY: number
): { x: number; y: number } => ({
  x: Math.max(rect.left, Math.min(pointX, rect.right)),
  y: Math.max(rect.top, Math.min(pointY, rect.bottom)),
});

const getElementCenter = (element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

// Touch detection
const isTouchDevice = (): boolean => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

// DOM manipulation functions
const createCursorElement = (isTouch: boolean): HTMLElement => {
  const cursor = document.createElement("div");
  cursor.className = isTouch ? "custom-cursor touch-cursor" : "custom-cursor mouse-cursor";
  document.body.appendChild(cursor);
  return cursor;
};

const createCursorStyles = (mouseSize: number, touchSize: number): string => `
  body.hovering-map { cursor: none; }
  .custom-cursor {
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
  .custom-cursor.mouse-cursor {
    width: ${mouseSize}px;
    height: ${mouseSize}px;
  }
  .custom-cursor.touch-cursor {
    width: ${touchSize}px;
    height: ${touchSize}px;
    pointer-events: auto;
  }
  body.hovering-map .custom-cursor {
    opacity: 1;
  }
  @media (hover: none) {
    body.hovering-map {
      cursor: auto;
    }
    .custom-cursor.touch-cursor {
      display: block !important;
      opacity: 1 !important;
    }
    .custom-cursor.mouse-cursor {
      display: none !important;
    }
  }
`;

const applyCursorStyles = (mouseSize: number, touchSize: number): void => {
  const style = document.createElement("style");
  style.textContent = createCursorStyles(mouseSize, touchSize);
  document.head.appendChild(style);
};

// Touch handling functions
const getTouchFromEvent = (e: Event): Touch | null => {
  const touchEvent = e as TouchEventWithTouches;
  return "touches" in touchEvent && touchEvent.touches.length > 0
    ? touchEvent.touches[0]
    : null;
};

const findTouchedCountries = (
  container: HTMLElement | null,
  cursorX: number,
  cursorY: number,
  size: number,
  detectionRadiusMultiplier: number = 1
): string[] => {
  if (!container) return [];

  const touchedCountries: string[] = [];
  const countryElements = container.querySelectorAll("path");
  const cursorRadius = (size / 2) * detectionRadiusMultiplier;

  countryElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const { x: closestX, y: closestY } = getClosestPointOnRectangle(
      rect,
      cursorX,
      cursorY
    );
    const distance = calculateDistance(cursorX, cursorY, closestX, closestY);

    if (distance <= cursorRadius) {
      const countryName = element.getAttribute("data-country");
      if (countryName) touchedCountries.push(countryName);
    }
  });

  return touchedCountries;
};

export function useCustomCursor(
  mouseSize: number = MOUSE_CURSOR_SIZE,
  touchSize: number = TOUCH_CURSOR_SIZE,
  emit?: () => void
) {
  const state = ref<CursorState>({
    element: null,
    isTouchDevice: false,
    isVisible: false,
    isDragging: false,
    touchStartPosition: null,
  });
  const containerRef = ref<HTMLElement | null>(null);

  const updateCursorVisibility = (isVisible: boolean): void => {
    document.body.classList.toggle("hovering-map", isVisible);
  };

  const updateCursorPosition = (
    cursor: HTMLElement,
    position: PointerPosition
  ): void => {
    if (!state.value.element || !containerRef.value) return;

    const rect = containerRef.value.getBoundingClientRect();
    const currentSize = state.value.isTouchDevice ? touchSize : mouseSize;
    const cursorRadius = currentSize / 2;

    // Constrain the cursor position within the map boundaries
    const constrainedX = Math.max(
      rect.left + cursorRadius,
      Math.min(position.clientX, rect.right - cursorRadius)
    );
    const constrainedY = Math.max(
      rect.top + cursorRadius,
      Math.min(position.clientY, rect.bottom - cursorRadius)
    );

    cursor.style.left = `${constrainedX}px`;
    cursor.style.top = `${constrainedY}px`;
  };

  const initializeCursorPosition = () => {
    if (!state.value.element || !containerRef.value) return;

    const rect = containerRef.value.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    updateCursorPosition(state.value.element, {
      clientX: centerX,
      clientY: centerY,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (state.value.isVisible && state.value.element && !state.value.isTouchDevice) {
      updateCursorPosition(state.value.element, {
        clientX: e.clientX,
        clientY: e.clientY,
      });
    }
  };

  const handleContainerEnter = () => {
    if (!state.value.isTouchDevice) {
      state.value.isVisible = true;
      updateCursorVisibility(true);
    }
  };

  const handleContainerLeave = () => {
    if (!state.value.isTouchDevice) {
      state.value.isVisible = false;
      updateCursorVisibility(false);
    }
  };

  const handleMouseClick = (e: MouseEvent) => {
    if (state.value.isTouchDevice) return;
    
    const touchedCountries = findTouchedCountries(
      containerRef.value,
      e.clientX,
      e.clientY,
      mouseSize
    );

    if (touchedCountries.length > 0 && emit) {
      emit();
    }
  };

  const handleTouchStart = (e: Event) => {
    const touch = getTouchFromEvent(e);
    if (!touch || !state.value.element || !containerRef.value) return;

    const rect = containerRef.value.getBoundingClientRect();

    // Only handle touch events that start within the map boundaries
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      state.value.touchStartPosition = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      };
      state.value.isDragging = false;
      state.value.isVisible = true;
      updateCursorVisibility(true);
      updateCursorPosition(state.value.element, {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      (e as TouchEventWithTouches).preventDefault();
    }
  };

  const handleTouchMove = (e: Event) => {
    if (!state.value.touchStartPosition || !state.value.element) return;

    const touch = getTouchFromEvent(e);
    if (!touch) return;

    // Check if we've moved enough to consider this a drag
    const distance = calculateDistance(
      state.value.touchStartPosition.clientX,
      state.value.touchStartPosition.clientY,
      touch.clientX,
      touch.clientY
    );

    if (distance > 10) { // 10px threshold for drag detection
      state.value.isDragging = true;
    }

    updateCursorPosition(state.value.element, {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!state.value.touchStartPosition || !state.value.element) return;

    const { x: cursorX, y: cursorY } = getElementCenter(state.value.element);

    // Handle both tap and drag end
    const touchedCountries = findTouchedCountries(
      containerRef.value,
      cursorX,
      cursorY,
      touchSize
    );

    if (touchedCountries.length > 0 && emit) {
      emit();
    }

    state.value.isDragging = false;
    state.value.isVisible = false;
    state.value.touchStartPosition = null;
    updateCursorVisibility(false);
  };

  onMounted(() => {
    if (!containerRef.value) return;

    // Detect touch device once on mount
    state.value.isTouchDevice = isTouchDevice();

    state.value.element = createCursorElement(state.value.isTouchDevice);
    applyCursorStyles(mouseSize, touchSize);

    // Initialize cursor position
    initializeCursorPosition();

    if (!state.value.isTouchDevice) {
      // Mouse device event listeners
      document.addEventListener("mousemove", handleMouseMove);
      containerRef.value.addEventListener("mouseenter", handleContainerEnter);
      containerRef.value.addEventListener("mouseleave", handleContainerLeave);
      containerRef.value.addEventListener("click", handleMouseClick);
    } else {
      // Touch device event listeners
      document.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    // Add resize handler to reposition cursor if needed
    window.addEventListener("resize", initializeCursorPosition);
  });

  onUnmounted(() => {
    if (!state.value.isTouchDevice && containerRef.value) {
      document.removeEventListener("mousemove", handleMouseMove);
      containerRef.value.removeEventListener("mouseenter", handleContainerEnter);
      containerRef.value.removeEventListener("mouseleave", handleContainerLeave);
      containerRef.value.removeEventListener("click", handleMouseClick);
    } else {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    }

    window.removeEventListener("resize", initializeCursorPosition);

    if (state.value.element?.parentNode) {
      state.value.element.parentNode.removeChild(state.value.element);
    }
  });

  return {
    containerRef,
    cursor: state.value.element,
    isTouchDevice: state.value.isTouchDevice,
    isVisible: state.value.isVisible,
    isDragging: state.value.isDragging,
    findTouchedCountries: (
      container: HTMLElement | null,
      cursorX: number,
      cursorY: number
    ) => findTouchedCountries(
      container, 
      cursorX, 
      cursorY, 
      state.value.isTouchDevice ? touchSize : mouseSize
    ),
  };
}
