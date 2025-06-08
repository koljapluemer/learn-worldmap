declare module 'igu-schemas' {
  export type SchemaData = [LessonData, ...LessonData[]];
  
  export type LessonData = {
    id: string;
    name: string;
    templates: [ExerciseTemplateData, ...ExerciseTemplateData[]];
    [k: string]: unknown;
  };

  export interface ExerciseTemplateData {
    id: string;
    instruction: string;
    exerciseType: ExerciseType;
    generator: Generator;
    data?: {
      [k: string]: unknown;
    };
    blockedBy?: string[];
    [k: string]: unknown;
  }

  export interface ExerciseType {
    name: 'BY_INSTRUCTION';
    data?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }

  export interface Generator {
    name: 'SINGLE' | 'VARY_PROPERTY_WHOLE_NUMBER_RANGE';
    data?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }
} 