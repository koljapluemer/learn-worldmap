/**
 * Seeded random number generator
 * @param seed - The seed value
 * @returns A random number between 0 and 1
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

/**
 * Get the current seed value based on environment
 * @returns A number representing the seed
 */
function getSeedValue(): number {
  // In test mode, return a consistent seed value
  if (import.meta.env.MODE === 'test') {
    return 123456789 // Consistent seed for tests
  }
  
  const now = new Date()
  const utcDateTime = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.${String(now.getUTCMilliseconds()).padStart(3, '0')}`
  return utcDateTime.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

/**
 * Generate a daily seed from UTC date
 * @returns A number representing the seed for the current UTC date
 */
export function getDailySeed(): number {
  // In test mode, return a consistent seed value
  if (import.meta.env.MODE === 'test') {
    return 987654321 // Consistent daily seed for tests
  }
  
  const now = new Date()
  const utcDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
  return utcDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

/**
 * Generate a seed from the current UTC datetime including milliseconds
 * @returns A number representing the seed for the current UTC datetime
 */
export function getCurrentSeed(): number {
  return getSeedValue()
}

/**
 * Get a random integer between min (inclusive) and max (exclusive) using a seed
 * @param seed - The seed value
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive)
 * @returns A random integer between min and max
 */
export function seededRandomInt(seed: number, min: number, max: number): number {
  return Math.floor(seededRandom(seed) * (max - min)) + min
}

/**
 * Get a random element from an array using a seed
 * @param seed - The seed value
 * @param array - The array to select from
 * @returns A random element from the array
 */
export function seededRandomElement<T>(seed: number, array: T[]): T {
  const index = seededRandomInt(seed, 0, array.length)
  return array[index]
} 