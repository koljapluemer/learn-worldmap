import { describe, it, expect } from 'vitest';
import { loadLessons } from './loadLessons';
import { Lesson } from './Lesson';
import { ExerciseTemplate } from './ExerciseTemplate';

describe('loadLessons', () => {
  it('should load lessons and create proper relationships', async () => {
    const lessons = await loadLessons();
    
    // Basic structure checks
    expect(lessons).toBeInstanceOf(Array);
    expect(lessons.length).toBeGreaterThan(0);
    
    // Check first lesson structure
    const firstLesson = lessons[0];
    expect(firstLesson).toBeInstanceOf(Lesson);
    expect(firstLesson.id).toBeDefined();
    expect(firstLesson.name).toBeDefined();
    expect(firstLesson.country).toBeDefined();
    expect(firstLesson.templates).toBeInstanceOf(Array);
    
    // Check templates structure
    const firstTemplate = firstLesson.templates[0];
    expect(firstTemplate).toBeInstanceOf(ExerciseTemplate);
    expect(firstTemplate.id).toBeDefined();
    expect(firstTemplate.instruction).toBeDefined();
    expect(firstTemplate.exerciseType).toBeDefined();
    expect(firstTemplate.generator).toBeDefined();
    expect(firstTemplate.data).toBeDefined();
    
    // Check blockedBy relationships
    // Find a lesson that has templates with blockedBy relationships
    const lessonWithBlockedBy = lessons.find(lesson => 
      lesson.templates.some(template => template.blockedBy.length > 0)
    );
    
    if (lessonWithBlockedBy) {
      const templateWithBlockedBy = lessonWithBlockedBy.templates.find(
        template => template.blockedBy.length > 0
      );
      
      expect(templateWithBlockedBy).toBeDefined();
      if (templateWithBlockedBy) {
        expect(templateWithBlockedBy.blockedBy).toBeInstanceOf(Array);
        expect(templateWithBlockedBy.blockedBy.length).toBeGreaterThan(0);
        expect(templateWithBlockedBy.blockedBy[0]).toBeInstanceOf(ExerciseTemplate);
      }
    }
  });
}); 