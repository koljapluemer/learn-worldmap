<script setup lang="ts">
import type { LearningGoal } from '../learning-goal/LearningGoalType';

defineProps<{
  learningGoal: LearningGoal,
  getDirectChildrenCount: (goal: LearningGoal) => number,
  getAllDescendantsCount: (goal: LearningGoal) => number,
}>();
</script>

<template>
  <div class="border rounded p-2 bg-base-100">
    {{ learningGoal.description }}
    <div class="text-xs text-gray-500 mt-1">
      Direct children: {{ getDirectChildrenCount(learningGoal) }}<br>
      All descendants: {{ getAllDescendantsCount(learningGoal) }}
    </div>
  </div>
</template>
