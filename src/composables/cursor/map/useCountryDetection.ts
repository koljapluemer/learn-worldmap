import type { Point } from '../geometry/calculations'
import { calculateDistance, getClosestPointOnRectangle } from '../geometry/calculations'

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

export function useCountryDetection(size: number = 76) {
  const handleInteractionEnd = (position: Point) => {
    const container = document.querySelector('.map-container')
    if (!container) return

    const touchedCountries = findTouchedCountries(
      container as HTMLElement,
      position.x,
      position.y,
      size
    )

    if (touchedCountries.length > 0) {
      dispatchMapClickEvent(container as HTMLElement, position.x, position.y)
    }
  }

  return {
    handleInteractionEnd,
    findTouchedCountries
  }
} 