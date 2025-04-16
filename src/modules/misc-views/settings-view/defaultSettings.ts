export const DEFAULT_MAP_SETTINGS = {
  waterColor: '#dcefff',
  landColor: '#e6e6e6',
  borderColor: '#333333',
  borderThickness: 1
} as const

export type MapSettings = {
  waterColor: string
  landColor: string
  borderColor: string
  borderThickness: number
}

export function getMapSettings(): MapSettings {
  return {
    waterColor: localStorage.getItem('waterColor') || DEFAULT_MAP_SETTINGS.waterColor,
    landColor: localStorage.getItem('landColor') || DEFAULT_MAP_SETTINGS.landColor,
    borderColor: localStorage.getItem('borderColor') || DEFAULT_MAP_SETTINGS.borderColor,
    borderThickness: Number(localStorage.getItem('borderThickness')) || DEFAULT_MAP_SETTINGS.borderThickness
  }
} 