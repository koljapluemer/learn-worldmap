export interface LearningGoalData {
    name: string;
    description?: string;
    parents?: string[];
    blockedBy?: string[];
    exercises?: string[];
    inherentInterest?: number;
    inherentDifficulty?: number;
    data?: Record<string, unknown>;
}

export interface MapLearningGoalData extends LearningGoalData {
    data: {
        typeOfGeopoliticalUnit?: string;
        geopoliticalUnit?: string;
    };
}

export interface ExerciseData  {
    id: string;
    instruction: string;
    data?: Record<string, unknown>;
  };

  export interface MapExerciseData extends ExerciseData {
    data: {
        zoom: number;
        panIndex?: number;
        country: string;
    };
  }