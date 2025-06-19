import type { Card } from "ts-fsrs";



export interface ExerciseCard extends Card {
  exerciseId: string;
}

export interface LessonCard extends Card {
  id: string;
  name: string;
}

