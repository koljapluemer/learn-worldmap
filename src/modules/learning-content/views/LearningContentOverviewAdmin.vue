<script setup lang="ts">
import { useLearningData } from '../data/useLearningData';
import LearningGoalWidget from './LearningGoalWidget.vue';

const { getRootLearningGoals, getDirectChildrenCount, getAllDescendantsCount } = useLearningData();
const learningGoals = getRootLearningGoals();
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Learning Goals Admin Overview</h1>
    <div class="space-y-2">
      <LearningGoalWidget
        v-for="goal in learningGoals"
        :key="goal.name"
        :learning-goal="goal"
        :get-direct-children-count="getDirectChildrenCount"
        :get-all-descendants-count="getAllDescendantsCount"
      />
    </div>
  </div>
</template>
