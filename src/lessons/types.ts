export type ExerciseType = {
  name: 'BY_INSTRUCTION';
};

export type Generator = {
  name: 'SINGLE' | 'VARY_PROPERTY_WHOLE_NUMBER_RANGE';
  data?: {
    propertyToVary: string;
    lowestVariationNumber: number;
    highestVariationNumber: number;
  };
};

export type Exercise = {
  id: string;
  instruction: string;
  data: {
    zoom: number;
    scope: 'world' | 'region' | 'neighborhood';
    [key: string]: unknown;
  };
};

export type ExerciseTemplateData = {
  id: string;
  instruction: string;
  exerciseType: ExerciseType;
  generator: Generator;
  data: {
    zoom: number;
    scope: 'world' | 'region' | 'neighborhood';
  };
  blockedBy?: string[];
};

export type LessonData = {
  id: string;
  name: string;
  templates: ExerciseTemplateData[];
  data: {
    country: string;
  };
};
