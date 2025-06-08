import { describe, it, expect } from 'vitest';
import { ExerciseTemplate } from './ExerciseTemplate';
import { loadLessons } from './loadLessons';

describe('ExerciseTemplate', () => {
  it('should generate a single exercise for SINGLE generator', async () => {
    const lessons = await loadLessons();
    const template = lessons[0].templates[0]; // First template is SINGLE generator
    
    const exercises = template.generateExercises(123);
    
    expect(exercises).toHaveLength(1);
    expect(exercises[0]).toEqual({
      id: `${template.id}-exercise-1`,
      instruction: template.instruction,
      data: {
        ...template.data
      }
    });
  });

  it('should generate multiple exercises for VARY_PROPERTY_WHOLE_NUMBER_RANGE generator', async () => {
    const lessons = await loadLessons();
    const template = lessons[0].templates[1]; // Second template is VARY_PROPERTY_WHOLE_NUMBER_RANGE generator
    
    const exercises = template.generateExercises(123);
    
    // Should generate exercises for each number in the range
    const expectedCount = template.generator.data!.highestVariationNumber - 
                         template.generator.data!.lowestVariationNumber + 1;
    expect(exercises).toHaveLength(expectedCount);
    
    // Check that each exercise has the correct structure
    exercises.forEach((exercise, index) => {
      expect(exercise.id).toBe(`${template.id}-exercise-${index + 1}`);
      expect(exercise.instruction).toBe(template.instruction);
      expect(exercise.data).toEqual({
        ...template.data,
        [template.generator.data!.propertyToVary]: index + template.generator.data!.lowestVariationNumber
      });
    });
  });

  it('should generate different order with different seeds', async () => {
    const lessons = await loadLessons();
    const template = lessons[0].templates[1]; // Second template is VARY_PROPERTY_WHOLE_NUMBER_RANGE generator
    
    const exercises1 = template.generateExercises(123);
    const exercises2 = template.generateExercises(456);
    
    // The exercises should have the same content but potentially different order
    expect(exercises1).toHaveLength(exercises2.length);
    
    // Check that all exercises from first set exist in second set
    const exerciseIds1 = new Set(exercises1.map(e => e.id));
    const exerciseIds2 = new Set(exercises2.map(e => e.id));
    expect(exerciseIds1).toEqual(exerciseIds2);
    
    // Check that the order is different (this might occasionally fail if random shuffle produces same order)
    const isDifferentOrder = exercises1.some((exercise, index) => exercise.id !== exercises2[index].id);
    expect(isDifferentOrder).toBe(true);
  });

  it('should throw error for unsupported generator type', async () => {
    const lessons = await loadLessons();
    const template = lessons[0].templates[0];
    
    // Modify the generator to an unsupported type
    (template as any).generator.name = 'UNSUPPORTED';
    
    expect(() => template.generateExercises(123)).toThrow('Unsupported generator type: UNSUPPORTED');
  });
}); 