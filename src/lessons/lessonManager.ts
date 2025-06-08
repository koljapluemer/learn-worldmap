import { Lesson } from 'igu-algos'
import lessonsData from './lessons.json'

export class LessonManager {
  private lessons: Lesson[]

  constructor() {
    this.lessons = lessonsData.map(lessonData => new Lesson(lessonData))
  }

  public getLessons(): Lesson[] {
    return this.lessons
  }

  public getLessonByCountry(country: string): Lesson | undefined {
    return this.lessons.find(lesson => (lesson as any).country === country)
  }

  public generateExercise(country: string) {
    const lesson = this.getLessonByCountry(country)
    if (!lesson) {
      throw new Error(`No lesson found for country: ${country}`)
    }
    return (lesson as any).generateExercise()
  }
}
