import type { LessonData } from './types';
import { Lesson } from './Lesson';
import lessonsData from './lessons.json';

export async function loadLessons(): Promise<Lesson[]> {
  try {
    return (lessonsData as LessonData[]).map(lessonData => Lesson.fromJSON(lessonData));
  } catch (error) {
    console.error('Error loading lessons:', error);
    throw error;
  }
}
