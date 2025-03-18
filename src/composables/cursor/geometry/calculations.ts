export interface Point {
  x: number
  y: number
}

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x1 - x2
  const dy = y1 - y2
  return Math.sqrt(dx * dx + dy * dy)
}

export const getClosestPointOnRectangle = (
  rect: DOMRect,
  pointX: number,
  pointY: number
): Point => ({
  x: Math.max(rect.left, Math.min(pointX, rect.right)),
  y: Math.max(rect.top, Math.min(pointY, rect.bottom))
})

export const isPointInCircle = (
  pointX: number,
  pointY: number,
  centerX: number,
  centerY: number,
  radius: number
): boolean => {
  const distance = calculateDistance(pointX, pointY, centerX, centerY)
  return distance <= radius
}

export const getElementCenter = (element: HTMLElement): Point => {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

export const constrainPointToRectangle = (
  point: Point,
  rect: DOMRect,
  radius: number
): Point => ({
  x: Math.max(rect.left + radius, Math.min(point.x, rect.right - radius)),
  y: Math.max(rect.top + radius, Math.min(point.y, rect.bottom - radius))
}) 