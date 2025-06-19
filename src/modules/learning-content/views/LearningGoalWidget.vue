<script setup lang="ts">
import type { LearningGoal } from '../learning-goal/LearningGoalType';

defineProps<{ learningGoal: LearningGoal }>();
</script>

<template>
  <div class="border rounded p-2 bg-base-100">
    {{ learningGoal.description }}
  </div>
</template>
