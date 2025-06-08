import type { Card } from "ts-fsrs";

export interface LearningEvent {
  id?: number;  // Auto-incremented primary key
  deviceId: string;
  timestamp: Date;
  exerciseId: string;
  msFromExerciseToFirstClick: number;
  msFromExerciseToFinishClick: number;
  numberOfClicksNeeded: number;
  distanceOfFirstClickToCenterOfCountry: number;
}

export interface ExerciseCard extends Card {
  exerciseId: string;
}

export interface LessonCard extends Card {
  id: string;
  name: string;
}

