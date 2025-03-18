export const createCursorStyles = (size: number): string => `
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

export function useCursorStyles(size: number = 76) {
  const applyCursorStyles = (): void => {
    const style = document.createElement('style')
    style.textContent = createCursorStyles(size)
    document.head.appendChild(style)
  }

  return {
    applyCursorStyles
  }
} 