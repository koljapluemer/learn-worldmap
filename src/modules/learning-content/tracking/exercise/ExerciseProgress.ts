import type { Card } from "ts-fsrs";


export interface ExerciseProgress extends Card {
  exerciseId: string;
  streak: number;
}