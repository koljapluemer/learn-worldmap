import type { LearningGoal } from "../learning-goal/LearningGoalType";

export type ExerciseType = {
  id: string;
  instruction: string;
  parents: LearningGoal[];
  data: {
    zoom: number;
    panIndex?: number;
    country: string;
  };
};
