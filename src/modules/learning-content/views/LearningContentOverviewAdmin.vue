<script setup lang="ts">
import { computed } from 'vue';
import { useLearningData } from '../data/useLearningData';
import LearningGoalWidget from './LearningGoalWidget.vue';
import { useLearningGoalProgressStore } from '../tracking/learning-goal-progress/learningGoalProgressStore';
import { useExerciseProgressStore } from '../tracking/exercise/exerciseProgressStore';

const {
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
  getLearningGoalsWithProgress,
  getOverallExerciseStatistics,
  getUniqueOverallExerciseStatistics,
  getOverallProgressStatistics,
  getBlacklistStatistics,
  getExerciseCountStatistics,
  getLearningGoalsByMostDueAbsolute,
  getLearningGoalsByMostDuePercentage
} = useLearningData();
const progressStore = useLearningGoalProgressStore();
const exerciseProgressStore = useExerciseProgressStore();

const allGoals = computed(() => getAllLearningGoals());
const allGoalsWithProgress = computed(() => getLearningGoalsWithProgress(progressStore));
const isBlacklisted = (name: string) => progressStore.getProgress(name)?.isBlacklisted ?? false;
const learningGoals = getRootLearningGoals();

// Get all statistics from composable
const blacklistStats = computed(() => getBlacklistStatistics(progressStore.getProgress));
const exerciseCountStats = computed(() => getExerciseCountStatistics(progressStore.getProgress));
const overallExerciseStats = computed(() => getUniqueOverallExerciseStatistics(exerciseProgressStore));
const overallProgressStats = computed(() => getOverallProgressStatistics(progressStore));

function showRandomExercise() {
  const ex = getRandomExercise();
  if (!ex) {
    alert('No exercise found!');
    return;
  }
  alert(`Random Exercise:\nID: ${ex.id}\nInstruction: ${ex.instruction}`);
}

function showLearningGoalsWithMostDueAbsolute() {
  const topGoals = getLearningGoalsByMostDueAbsolute(exerciseProgressStore);
  if (topGoals.length === 0) {
    alert('No learning goals have due exercises.');
    return;
  }
  
  const message = topGoals
    .map((item, index) => `${index + 1}. ${item.goal.description || item.goal.name} (${item.dueCount} due)`)
    .join('\n');
  
  alert(`Top 10 Learning Goals with Most Due Exercises:\n\n${message}`);
}

function showLearningGoalsWithMostDuePercentage() {
  const topGoals = getLearningGoalsByMostDuePercentage(exerciseProgressStore);
  if (topGoals.length === 0) {
    alert('No learning goals have due exercises.');
    return;
  }
  
  const message = topGoals
    .map((item, index) => `${index + 1}. ${item.goal.description || item.goal.name} (${item.duePercentage}% due)`)
    .join('\n');
  
  alert(`Top 10 Learning Goals with Highest Due Percentage:\n\n${message}`);
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Learning Goals Admin Overview</h1>
    <button class="btn btn-primary btn-sm mb-4" @click="showRandomExercise">Get random exercise</button>
    <button class="btn btn-secondary btn-sm mb-4 ml-2" @click="showLearningGoalsWithMostDueAbsolute">Show learning goals with most due (absolute)</button>
    <button class="btn btn-secondary btn-sm mb-4 ml-2" @click="showLearningGoalsWithMostDuePercentage">Show learning goals with most due (%)</button>
    <div class="mb-2 text-sm">
      <span class="mr-4">Total: <b>{{ allGoals.length }}</b></span>
      <span class="mr-4">Blacklisted: <b class="text-red-500">{{ blacklistStats.blacklistedCount }}</b></span>
      <span class="mr-4">Effectively blacklisted: <b class="text-orange-500">{{ blacklistStats.effectivelyBlacklistedCount }}</b></span>
      <span>Active: <b class="text-green-600">{{ blacklistStats.activeCount }}</b></span>
    </div>
    <div class="mb-4 text-sm">
      <span class="mr-4">Exercises: <b>{{ exerciseCountStats.totalExercises }}</b></span>
      <span class="mr-4">Active: <b class="text-green-600">{{ exerciseCountStats.exercisesOnActive }}</b></span>
      <span>Blacklisted: <b class="text-orange-500">{{ exerciseCountStats.exercisesOnEffectivelyBlacklisted }}</b></span>
    </div>
    <div class="mb-4 text-sm">
      <span class="mr-4">Goals with progress: <b class="text-blue-600">{{ overallProgressStats.goalsWithProgress }}</b></span>
      <span>Total practice sessions: <b class="text-blue-600">{{ overallProgressStats.totalProgressEntries }}</b></span>
    </div>
    <div class="mb-4 text-sm">
      <span class="mr-4">New exercises: <b class="text-blue-600">{{ overallExerciseStats.totalNew }}</b></span>
      <span class="mr-4">Due now: <b class="text-orange-600">{{ overallExerciseStats.totalDue }}</b></span>
      <span>Not due: <b class="text-gray-600">{{ overallExerciseStats.totalNotDue }}</b></span>
    </div>
    <div class="space-y-2">
      <LearningGoalWidget
        v-for="goal in learningGoals"
        :key="goal.name"
        :learning-goal="goal"
        :get-direct-children-count="getDirectChildrenCount"
        :get-all-descendants-count="getAllDescendantsCount"
        :get-direct-exercises-count="getDirectExercisesCount"
        :get-all-descendant-exercises-count="getAllDescendantExercisesCount"
        :get-direct-parents-count="getDirectParentsCount"
        :get-all-ancestors-count="getAllAncestorsCount"
        :is-effectively-blacklisted="isEffectivelyBlacklisted"
        :is-blacklisted="isBlacklisted"
        :get-effective-interest="getEffectiveInterest"
        :get-effective-difficulty="getEffectiveDifficulty"
      />
    </div>
  </div>
</template>
