export interface LearningGoalData {
    name: string;
    description?: string;
    children?: string[];
    parents?: string[];
    exercises?: string[];
    data?: Record<string, unknown>;
}

export interface MapLearningGoalData extends LearningGoalData {
    data: {
        country?: string;
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
        panIndex: number;
        country: string;
    };
  }