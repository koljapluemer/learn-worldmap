import { ref } from 'vue';
import type { LearningGoal } from '../learning-goal/LearningGoalType';
import type { ExerciseType } from '../exercise/ExerciseType';
import learningGoalsRaw from './learningGoals.min.json';
import exercisesRaw from './exercises.min.json';
import type { LearningGoalData, ExerciseData } from '../dataTypes';

// Helper to type the imported JSON
const learningGoalsData: Record<string, LearningGoalData> = learningGoalsRaw as any;
const exercisesData: Record<string, ExerciseData> = exercisesRaw as any;

// Build ExerciseType map
const exerciseMap: Record<string, ExerciseType> = {};
Object.values(exercisesData).forEach((ex) => {
  exerciseMap[ex.id] = { id: ex.id };
});

// First pass: create all LearningGoal objects with empty relations
const learningGoalMap: Record<string, LearningGoal> = {};
Object.entries(learningGoalsData).forEach(([name, data]) => {
  learningGoalMap[name] = {
    name: data.name,
    description: data.description,
    parents: [],
    children: [],
    blockedBy: [],
    exercises: [],
    inherentInterest: data.inherentInterest ?? 0,
    inherentDifficulty: data.inherentDifficulty ?? 0,
    data: {
      ...(data.data || {}),
    },
  };
});

// Second pass: resolve relations
Object.entries(learningGoalsData).forEach(([name, data]) => {
  const goal = learningGoalMap[name];
  // Parents
  if (data.parents) {
    goal.parents = data.parents.map((p) => learningGoalMap[p]).filter(Boolean);
  }
  // Children (reverse lookup)
  goal.children = Object.values(learningGoalMap).filter((g) => g.parents.includes(goal));
  // BlockedBy
  if (data.blockedBy) {
    goal.blockedBy = data.blockedBy.map((b) => learningGoalMap[b]).filter(Boolean);
  }
  // Exercises
  if (data.exercises) {
    goal.exercises = data.exercises.map((eid) => exerciseMap[eid]).filter(Boolean);
  }
});

const allLearningGoals = ref<LearningGoal[]>(Object.values(learningGoalMap));

function getAllLearningGoals(): LearningGoal[] {
  return allLearningGoals.value;
}

function getRootLearningGoals(): LearningGoal[] {
  return allLearningGoals.value.filter((g) => !g.parents.length);
}

export function useLearningData() {
  return {
    getAllLearningGoals,
    getRootLearningGoals,
  };
}
