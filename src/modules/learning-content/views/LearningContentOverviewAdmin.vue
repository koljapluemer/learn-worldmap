<script setup lang="ts">
import { computed } from 'vue';
import { useLearningData } from '../data/useLearningData';
import LearningGoalWidget from './LearningGoalWidget.vue';
import { useLearningGoalProgressStore } from '../tracking/learning-goal-progress/learningGoalProgressStore';

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
  getRandomExercise
} = useLearningData();
const progressStore = useLearningGoalProgressStore();

const allGoals = computed(() => getAllLearningGoals());
const isBlacklisted = (name: string) => progressStore.getProgress(name)?.isBlacklisted ?? false;
const blacklistedCount = computed(() =>
  allGoals.value.filter(goal => isBlacklisted(goal.name)).length
);
const effectivelyBlacklistedCount = computed(() =>
  allGoals.value.filter(goal => isEffectivelyBlacklisted(goal, isBlacklisted)).length
);
const activeCount = computed(() =>
  allGoals.value.length - effectivelyBlacklistedCount.value
);
const totalExercises = computed(() =>
  allGoals.value.reduce((sum, goal) => sum + goal.exercises.length, 0)
);
const exercisesOnEffectivelyBlacklisted = computed(() =>
  allGoals.value.filter(goal => isEffectivelyBlacklisted(goal, isBlacklisted)).reduce((sum, goal) => sum + goal.exercises.length, 0)
);
const exercisesOnActive = computed(() =>
  totalExercises.value - exercisesOnEffectivelyBlacklisted.value
);
const learningGoals = getRootLearningGoals();

function showRandomExercise() {
  const ex = getRandomExercise();
  if (!ex) {
    alert('No exercise found!');
    return;
  }
  alert(`Random Exercise:\nID: ${ex.id}\nInstruction: ${ex.instruction}`);
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Learning Goals Admin Overview</h1>
    <button class="btn btn-primary btn-sm mb-4" @click="showRandomExercise">Get random exercise</button>
    <div class="mb-2 text-sm">
      <span class="mr-4">Total: <b>{{ allGoals.length }}</b></span>
      <span class="mr-4">Blacklisted: <b class="text-red-500">{{ blacklistedCount }}</b></span>
      <span class="mr-4">Effectively blacklisted: <b class="text-orange-500">{{ effectivelyBlacklistedCount }}</b></span>
      <span>Active: <b class="text-green-600">{{ activeCount }}</b></span>
    </div>
    <div class="mb-4 text-sm">
      <span class="mr-4">Exercises: <b>{{ totalExercises }}</b></span>
      <span class="mr-4">Active: <b class="text-green-600">{{ exercisesOnActive }}</b></span>
      <span>Blacklisted: <b class="text-orange-500">{{ exercisesOnEffectivelyBlacklisted }}</b></span>
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
