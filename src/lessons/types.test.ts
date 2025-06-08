import { describe, it, expect } from 'vitest';
import type { Exercise, ExerciseTemplateData, LessonData } from './types';

describe('Types', () => {
  it('should allow valid Exercise data', () => {
    const exercise: Exercise = {
      id: 'test-1',
      instruction: 'Test instruction',
      data: {
        zoom: 1,
        scope: 'world',
        country: 'US'
      }
    };
    expect(exercise).toBeDefined();
  });

  it('should allow valid ExerciseTemplateData', () => {
    const template: ExerciseTemplateData = {
      id: 'template-1',
      instruction: 'Test template',
      exerciseType: { name: 'BY_INSTRUCTION' },
      generator: { name: 'SINGLE' },
      data: {
        zoom: 1,
        scope: 'world'
      }
    };
    expect(template).toBeDefined();
  });
}); 