import { ref } from 'vue';
import type { LearningGoal } from '../learning-goal/LearningGoalType';
import type { ExerciseType } from '../exercise/ExerciseType';
import learningGoalsRaw from './learningGoals.min.json';
import exercisesRaw from './exercises.min.json';
import type { LearningGoalData, ExerciseData } from '../dataTypes';

// Helper to type the imported JSON
const learningGoalsData: Record<string, LearningGoalData> = learningGoalsRaw as any;
const exercisesData: Record<string, ExerciseData> = exercisesRaw as any;

// Build ExerciseType map and array
const exerciseMap: Record<string, ExerciseType> = {};
const allExercisesArr: ExerciseType[] = [];
Object.values(exercisesData).forEach((ex) => {
  let data: ExerciseType['data'];
  if (ex.data && typeof ex.data.zoom === 'number' && typeof ex.data.country === 'string') {
    data = {
      zoom: ex.data.zoom,
      country: ex.data.country,
      ...(typeof ex.data.panIndex === 'number' ? { panIndex: ex.data.panIndex } : {})
    };
  } else {
    // fallback or skip if data is malformed
    // For now, skip exercises with invalid data
    return;
  }
  const exercise: ExerciseType = {
    id: ex.id,
    instruction: ex.instruction,
    data
  };
  exerciseMap[ex.id] = exercise;
  allExercisesArr.push(exercise);
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
Object.entries(learningGoalsData).forEach(([_name, data]) => {
  const goal = learningGoalMap[_name];
  // Parents
  if (data.parents) {
    goal.parents = data.parents.map((p) => learningGoalMap[p]).filter(Boolean);
  }
  // Children (by name, not by object reference)
  goal.children = Object.entries(learningGoalsData)
    .filter(([, childData]) => (childData.parents || []).includes(_name))
    .map(([childName]) => learningGoalMap[childName]);
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

function getDirectChildrenCount(goal: LearningGoal): number {
  return goal.children.length;
}

function getAllDescendantsCount(goal: LearningGoal): number {
  const visited = new Set<LearningGoal>();
  function countDescendants(g: LearningGoal): number {
    let count = 0;
    for (const child of g.children) {
      if (!visited.has(child)) {
        visited.add(child);
        count += 1 + countDescendants(child);
      }
    }
    return count;
  }
  return countDescendants(goal);
}

function getDirectExercisesCount(goal: LearningGoal): number {
  return goal.exercises.length;
}

function getAllDescendantExercisesCount(goal: LearningGoal): number {
  const visited = new Set<LearningGoal>();
  function countExercises(g: LearningGoal): number {
    if (visited.has(g)) return 0;
    visited.add(g);
    let count = g.exercises.length;
    for (const child of g.children) {
      count += countExercises(child);
    }
    return count;
  }
  return countExercises(goal);
}

function getDirectParentsCount(goal: LearningGoal): number {
  return goal.parents.length;
}

function getAllAncestorsCount(goal: LearningGoal): number {
  const visited = new Set<LearningGoal>();
  function countAncestors(g: LearningGoal): number {
    let count = 0;
    for (const parent of g.parents) {
      if (!visited.has(parent)) {
        visited.add(parent);
        count += 1 + countAncestors(parent);
      }
    }
    return count;
  }
  return countAncestors(goal);
}

// Returns true if this goal or any ancestor is blacklisted
function isEffectivelyBlacklisted(
  goal: LearningGoal,
  // eslint-disable-next-line no-unused-vars
  isBlacklisted: (goalName: string) => boolean,
  visited = new Set<string>()
): boolean {
  if (visited.has(goal.name)) return false; // Prevent infinite loop
  visited.add(goal.name);
  if (isBlacklisted(goal.name)) return true;
  for (const parent of goal.parents) {
    if (isEffectivelyBlacklisted(parent, isBlacklisted, visited)) return true;
  }
  return false;
}

function getEffectiveInterest(goal: LearningGoal, visited = new Set<string>()): number {
  if (visited.has(goal.name)) return 0;
  visited.add(goal.name);
  let sum = goal.inherentInterest;
  for (const parent of goal.parents) {
    sum += getEffectiveInterest(parent, visited);
  }
  return sum;
}

function getEffectiveDifficulty(goal: LearningGoal, visited = new Set<string>()): number {
  if (visited.has(goal.name)) return 0;
  visited.add(goal.name);
  let sum = goal.inherentDifficulty;
  for (const parent of goal.parents) {
    sum += getEffectiveDifficulty(parent, visited);
  }
  return sum;
}

// Expose a function to get a random exercise
function getRandomExercise(): ExerciseType | undefined {
  if (!allExercisesArr.length) return undefined;
  const idx = Math.floor(Math.random() * allExercisesArr.length);
  return allExercisesArr[idx];
}

export function useLearningData() {
  return {
    getAllLearningGoals,
    getRootLearningGoals,
    getDirectChildrenCount,
    getAllDescendantsCount,
    getDirectExercisesCount,
    getAllDescendantExercisesCount,
    getDirectParentsCount,
    getAllAncestorsCount,
    isEffectivelyBlacklisted,
    getEffectiveInterest,
    getEffectiveDifficulty,
    getRandomExercise,
  };
}
