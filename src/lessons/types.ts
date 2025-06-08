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

export type ExerciseTemplateData = {
  id: string;
  instruction: string;
  exerciseType: ExerciseType;
  generator: Generator;
  data: {
    zoom: number;
    scope: 'world' | 'region' | 'neighborhood';
  };
};

export type LessonData = {
  name: string;
  templates: ExerciseTemplateData[];
  country: string;
};
