import { describe, it, expect } from 'vitest'
import { LessonManager } from './lessonManager'
import { testLessons } from './testData'

describe('LessonManager', () => {
  it('should create lessons from data', () => {
    const manager = new LessonManager()
    const lessons = manager.getLessons()
    expect(lessons.length).toBeGreaterThan(0)
  })

  it('should find lesson by country', () => {
    const manager = new LessonManager()
    const lesson = manager.getLessonByCountry('Ireland')
    expect(lesson).toBeDefined()
  })

  it('should generate exercise for country', () => {
    const manager = new LessonManager()
    const exercise = manager.generateExercise('Ireland')
    expect(exercise).toBeDefined()
    expect(exercise.instruction).toBeDefined()
    expect(exercise.data).toBeDefined()
    expect(exercise.data.zoom).toBeDefined()
    expect(exercise.data.scope).toBeDefined()
  })

  it('should throw error for non-existent country', () => {
    const manager = new LessonManager()
    expect(() => manager.generateExercise('NonExistentCountry')).toThrow('No lesson found for country: NonExistentCountry')
  })
}) 