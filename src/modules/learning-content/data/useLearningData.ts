import { ref } from 'vue';
import type { LearningGoal } from '../learning-goal/LearningGoalType';
import type { ExerciseType } from '../exercise/ExerciseType';
import learningGoalsRaw from './learningGoals.min.json';
import exercisesRaw from './exercises.min.json';
import type { LearningGoalData, ExerciseData } from '../dataTypes';
import type { LearningGoalProgress } from '../tracking/learning-goal-progress/LearningGoalProgress';
import { useLearningGoalProgressStore } from '../tracking/learning-goal-progress/learningGoalProgressStore';
import type { ExerciseProgress } from '../tracking/exercise/ExerciseProgress';

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
    parents: [], // Will be filled in the second pass
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

// Third pass: fill exercise parents
Object.entries(learningGoalsData).forEach(([_name, data]) => {
  const goal = learningGoalMap[_name];
  if (data.exercises) {
    data.exercises.forEach((eid) => {
      const exercise = exerciseMap[eid];
      if (exercise) {
        exercise.parents.push(goal);
      }
    });
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

// Function to find learning goals by exercise ID
function findLearningGoalsByExerciseId(exerciseId: string): LearningGoal[] {
  return Object.values(learningGoalMap).filter(goal => 
    goal.exercises.some(exercise => exercise.id === exerciseId)
  );
}

// Function to get all ancestors of a learning goal (including the goal itself)
function getAllAncestors(goal: LearningGoal, visited = new Set<string>()): LearningGoal[] {
  if (visited.has(goal.name)) return [];
  visited.add(goal.name);
  
  const ancestors = [goal];
  for (const parent of goal.parents) {
    ancestors.push(...getAllAncestors(parent, visited));
  }
  return ancestors;
}

// Function to update learning goal progress recursively
function updateLearningGoalProgress(
  exerciseId: string,
  isCorrect: boolean,
  progressStore: ReturnType<typeof useLearningGoalProgressStore>
): void {
  const learningGoals = findLearningGoalsByExerciseId(exerciseId);
  
  for (const learningGoal of learningGoals) {
    const allAffectedGoals = getAllAncestors(learningGoal);
    
    for (const goal of allAffectedGoals) {
      const currentProgress = progressStore.getProgress(goal.name) || {
        learningGoalName: goal.name,
        repetitions: 0,
        streak: 0,
        correctRepetitionCount: 0
      };
      
      const updatedProgress: LearningGoalProgress = {
        ...currentProgress,
        lastSeenAt: new Date(),
        repetitions: (currentProgress.repetitions || 0) + 1,
        lastRepetitionCorrect: isCorrect,
        streak: isCorrect ? (currentProgress.streak || 0) + 1 : 0,
        correctRepetitionCount: (currentProgress.correctRepetitionCount || 0) + (isCorrect ? 1 : 0)
      };
      
      progressStore.setProgress(updatedProgress);
    }
  }
}

// Function to get learning goals with their progress data attached
function getLearningGoalsWithProgress(
  progressStore: ReturnType<typeof useLearningGoalProgressStore>
): Array<LearningGoal & { progress?: LearningGoalProgress }> {
  return Object.values(learningGoalMap).map(goal => ({
    ...goal,
    progress: progressStore.getProgress(goal.name)
  }));
}

// Function to get a single learning goal with progress data
function getLearningGoalWithProgress(
  goalName: string,
  progressStore: ReturnType<typeof useLearningGoalProgressStore>
): (LearningGoal & { progress?: LearningGoalProgress }) | undefined {
  const goal = learningGoalMap[goalName];
  if (!goal) return undefined;
  
  return {
    ...goal,
    progress: progressStore.getProgress(goalName)
  };
}

// Function to get all exercises belonging to a learning goal (recursively)
function getAllExercisesForLearningGoal(goal: LearningGoal, visited = new Set<string>()): ExerciseType[] {
  if (visited.has(goal.name)) return [];
  visited.add(goal.name);
  
  let exercises = [...goal.exercises];
  for (const child of goal.children) {
    exercises.push(...getAllExercisesForLearningGoal(child, visited));
  }
  return exercises;
}

// Function to calculate exercise statistics for a learning goal
function getExerciseStatisticsForLearningGoal(
  goal: LearningGoal,
  exerciseProgressStore: { progress: Record<string, ExerciseProgress> }
): {
  newExercises: number;
  dueExercises: number;
  notDueExercises: number;
  totalExercises: number;
  percentages: {
    new: number;
    due: number;
    notDue: number;
  };
} {
  const allExercises = getAllExercisesForLearningGoal(goal);
  const now = new Date();
  
  let newExercises = 0;
  let dueExercises = 0;
  let notDueExercises = 0;
  
  for (const exercise of allExercises) {
    const progress = exerciseProgressStore.progress[exercise.id];
    
    if (!progress) {
      // Exercise has never been practiced
      newExercises++;
    } else {
      // Exercise has been practiced, check if it's due
      const dueDate = new Date(progress.due);
      if (dueDate <= now) {
        dueExercises++;
      } else {
        notDueExercises++;
      }
    }
  }
  
  const totalExercises = newExercises + dueExercises + notDueExercises;
  const percentages = totalExercises === 0 
    ? { new: 0, due: 0, notDue: 0 }
    : {
        new: Math.round((newExercises / totalExercises) * 100),
        due: Math.round((dueExercises / totalExercises) * 100),
        notDue: Math.round((notDueExercises / totalExercises) * 100)
      };
  
  return {
    newExercises,
    dueExercises,
    notDueExercises,
    totalExercises,
    percentages
  };
}

// Function to get overall exercise statistics across all learning goals
function getOverallExerciseStatistics(
  exerciseProgressStore: { progress: Record<string, ExerciseProgress> }
): {
  totalNew: number;
  totalDue: number;
  totalNotDue: number;
} {
  let totalNew = 0;
  let totalDue = 0;
  let totalNotDue = 0;
  
  for (const goal of Object.values(learningGoalMap)) {
    const stats = getExerciseStatisticsForLearningGoal(goal, exerciseProgressStore);
    totalNew += stats.newExercises;
    totalDue += stats.dueExercises;
    totalNotDue += stats.notDueExercises;
  }
  
  return { totalNew, totalDue, totalNotDue };
}

// Function to get overall progress statistics
function getOverallProgressStatistics(
  progressStore: ReturnType<typeof useLearningGoalProgressStore>
): {
  goalsWithProgress: number;
  totalProgressEntries: number;
} {
  const allGoalsWithProgress = getLearningGoalsWithProgress(progressStore);
  const goalsWithProgress = allGoalsWithProgress.filter(goal => goal.progress).length;
  const totalProgressEntries = allGoalsWithProgress.reduce((sum, goal) => sum + (goal.progress?.repetitions || 0), 0);
  
  return { goalsWithProgress, totalProgressEntries };
}

// Function to get blacklist statistics
function getBlacklistStatistics(
  isBlacklistedFn: (goalName: string) => boolean
): {
  blacklistedCount: number;
  effectivelyBlacklistedCount: number;
  activeCount: number;
} {
  const allGoals = Object.values(learningGoalMap);
  const blacklistedCount = allGoals.filter(goal => isBlacklistedFn(goal.name)).length;
  const effectivelyBlacklistedCount = allGoals.filter(goal => isEffectivelyBlacklisted(goal, isBlacklistedFn)).length;
  const activeCount = allGoals.length - effectivelyBlacklistedCount;
  
  return { blacklistedCount, effectivelyBlacklistedCount, activeCount };
}

// Function to get exercise statistics
function getExerciseCountStatistics(
  isBlacklistedFn: (goalName: string) => boolean
): {
  totalExercises: number;
  exercisesOnEffectivelyBlacklisted: number;
  exercisesOnActive: number;
} {
  const allGoals = Object.values(learningGoalMap);
  const totalExercises = allGoals.reduce((sum, goal) => sum + goal.exercises.length, 0);
  const exercisesOnEffectivelyBlacklisted = allGoals
    .filter(goal => isEffectivelyBlacklisted(goal, isBlacklistedFn))
    .reduce((sum, goal) => sum + goal.exercises.length, 0);
  const exercisesOnActive = totalExercises - exercisesOnEffectivelyBlacklisted;
  
  return { totalExercises, exercisesOnEffectivelyBlacklisted, exercisesOnActive };
}

// Function to get learning goals sorted by most due exercises (absolute count)
function getLearningGoalsByMostDueAbsolute(
  exerciseProgressStore: { progress: Record<string, ExerciseProgress> }
): Array<{ goal: LearningGoal; dueCount: number }> {
  const goalsWithDueCounts = Object.values(learningGoalMap).map(goal => {
    const stats = getExerciseStatisticsForLearningGoal(goal, exerciseProgressStore);
    return { goal, dueCount: stats.dueExercises };
  });
  
  return goalsWithDueCounts
    .filter(item => item.dueCount > 0)
    .sort((a, b) => b.dueCount - a.dueCount)
    .slice(0, 10);
}

// Function to get learning goals sorted by most due exercises (percentage)
function getLearningGoalsByMostDuePercentage(
  exerciseProgressStore: { progress: Record<string, ExerciseProgress> }
): Array<{ goal: LearningGoal; duePercentage: number }> {
  const goalsWithDuePercentages = Object.values(learningGoalMap).map(goal => {
    const stats = getExerciseStatisticsForLearningGoal(goal, exerciseProgressStore);
    const duePercentage = stats.totalExercises > 0 
      ? Math.round((stats.dueExercises / stats.totalExercises) * 100)
      : 0;
    return { goal, duePercentage };
  });
  
  return goalsWithDuePercentages
    .filter(item => item.duePercentage > 0)
    .sort((a, b) => b.duePercentage - a.duePercentage)
    .slice(0, 10);
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
    findLearningGoalsByExerciseId,
    getAllAncestors,
    updateLearningGoalProgress,
    getLearningGoalsWithProgress,
    getLearningGoalWithProgress,
    getAllExercisesForLearningGoal,
    getExerciseStatisticsForLearningGoal,
    getOverallExerciseStatistics,
    getOverallProgressStatistics,
    getBlacklistStatistics,
    getExerciseCountStatistics,
    getLearningGoalsByMostDueAbsolute,
    getLearningGoalsByMostDuePercentage,
  };
}
