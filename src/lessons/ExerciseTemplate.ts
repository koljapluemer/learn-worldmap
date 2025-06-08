import type { ExerciseTemplateData, ExerciseType, Generator } from './types';

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

  static fromJSON(data: ExerciseTemplateData): ExerciseTemplate {
    return new ExerciseTemplate(data);
  }
}
