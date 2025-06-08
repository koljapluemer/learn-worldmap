import type { LessonData } from './types';
import { Lesson } from './Lesson';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export async function loadLessons(): Promise<Lesson[]> {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = join(__dirname, 'lessons.json');
    
    const fileContent = readFileSync(filePath, 'utf-8');
    const data: LessonData[] = JSON.parse(fileContent);
    return data.map(lessonData => Lesson.fromJSON(lessonData));
  } catch (error) {
    console.error('Error loading lessons:', error);
    throw error;
  }
}
