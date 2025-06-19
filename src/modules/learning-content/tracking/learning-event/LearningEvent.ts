export interface LearningEvent {
    timestamp: Date;
    exerciseId: string;
    msFromExerciseToFirstClick: number;
    msFromExerciseToFinishClick: number;
    numberOfClicksNeeded: number;
    distanceOfFirstClickToCenterOfCountry: number;
  }