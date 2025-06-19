import type { ExerciseType } from "../exercise/ExerciseType";

export type LearningGoal = {
  name: string;
  description?: string;
  parents: LearningGoal[];
  children: LearningGoal[];
  blockedBy: LearningGoal[];
  exercises: ExerciseType[];
  inherentInterest: number;
  inherentDifficulty: number;
  data: {
    typeOfGeopoliticalUnit?: string;
    geopoliticalUnit?: string;
  };
};
