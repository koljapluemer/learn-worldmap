import { Lesson } from './Lesson'
import type { LessonData } from './types'
import lessonsData from './lessons.json'

export class LessonManager {
  private static instance: LessonManager
  private lessons: Map<string, Lesson> = new Map()
  private lessonIds: string[] = []

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  static getInstance(): LessonManager {
    if (!LessonManager.instance) {
      LessonManager.instance = new LessonManager()
    }
    return LessonManager.instance
  }

  async loadLessons(): Promise<void> {
    // Clear existing lessons
    this.lessons.clear()
    this.lessonIds = []

    // Load lessons from JSON
    const lessons = (lessonsData as LessonData[]).map(data => {
      const lesson = Lesson.fromJSON(data)
      this.lessons.set(lesson.id, lesson)
      this.lessonIds.push(lesson.id)
      return lesson
    })
  }

  getLessonById(id: string): Lesson | undefined {
    return this.lessons.get(id)
  }

  getAllLessons(): Lesson[] {
    return Array.from(this.lessons.values())
  }

  getAllLessonIds(): string[] {
    return [...this.lessonIds]
  }

  getLessonCount(): number {
    return this.lessons.size
  }

  hasLesson(id: string): boolean {
    return this.lessons.has(id)
  }

  // Convenience method to get a random lesson
  getRandomLesson(seed: number): Lesson | undefined {
    if (this.lessonIds.length === 0) return undefined
    const randomIndex = Math.floor(seed * this.lessonIds.length)
    const randomId = this.lessonIds[randomIndex]
    return this.getLessonById(randomId)
  }
}
