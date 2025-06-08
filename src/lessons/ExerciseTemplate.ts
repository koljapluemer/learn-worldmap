import type { ExerciseTemplateData, ExerciseType, Generator, Exercise } from './types';
import { seededRandomInt } from '@/modules/randomness/random';

export class ExerciseTemplate {
  readonly id: string;
  readonly instruction: string;
  readonly exerciseType: ExerciseType;
  readonly generator: Generator;
  readonly data: {
    zoom: number;
    scope: 'world' | 'region' | 'neighborhood';
  };
  private _blockedBy: ExerciseTemplate[] = [];

  constructor(data: ExerciseTemplateData) {
    this.id = data.id;
    this.instruction = data.instruction;
    this.exerciseType = data.exerciseType;
    this.generator = data.generator;
    this.data = data.data;
  }

  get blockedBy(): ExerciseTemplate[] {
    return this._blockedBy;
  }

  setBlockedBy(templates: ExerciseTemplate[]): void {
    this._blockedBy = templates;
  }

  generateExercises(seed: number): Exercise[] {
    if (this.generator.name === 'SINGLE') {
      return [{
        id: `${this.id}-exercise-1`,
        instruction: this.instruction,
        data: { ...this.data }
      }];
    }

    if (this.generator.name === 'VARY_PROPERTY_WHOLE_NUMBER_RANGE' && this.generator.data) {
      const { propertyToVary, lowestVariationNumber, highestVariationNumber } = this.generator.data;
      const exercises: Exercise[] = [];

      // Generate one exercise for each value in the range
      for (let i = lowestVariationNumber; i <= highestVariationNumber; i++) {
        exercises.push({
          id: `${this.id}-exercise-${i + 1}`,
          instruction: this.instruction,
          data: {
            ...this.data,
            [propertyToVary]: i
          }
        });
      }

      // Shuffle the exercises using the seed
      return exercises.sort(() => seededRandomInt(seed, 0, 2) - 0.5);
    }

    throw new Error(`Unsupported generator type: ${this.generator.name}`);
  }

  pickRandomExercise(seed: number): Exercise {
    const exercises = this.generateExercises(seed);
    const randomIndex = seededRandomInt(seed, 0, exercises.length);
    return exercises[randomIndex];
  }

  static fromJSON(data: ExerciseTemplateData): ExerciseTemplate {
    return new ExerciseTemplate(data);
  }
}
