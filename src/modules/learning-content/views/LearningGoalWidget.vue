<script setup lang="ts">
import { ref } from 'vue';
import type { LearningGoal } from '../learning-goal/LearningGoalType';
import LearningGoalWidget from './LearningGoalWidget.vue';

defineProps<{
  learningGoal: LearningGoal,
  getDirectChildrenCount: (goal: LearningGoal) => number,
  getAllDescendantsCount: (goal: LearningGoal) => number,
  getDirectExercisesCount: (goal: LearningGoal) => number,
  getAllDescendantExercisesCount: (goal: LearningGoal) => number,
  getDirectParentsCount: (goal: LearningGoal) => number,
  getAllAncestorsCount: (goal: LearningGoal) => number,
}>();

const expanded = ref(false);
</script>

<template>
  <div class="border rounded p-2 bg-base-100">
    {{ learningGoal.description }}
    <div class="text-xs text-gray-500 mt-1">
      Direct children: {{ getDirectChildrenCount(learningGoal) }}<br>
      All descendants: {{ getAllDescendantsCount(learningGoal) }}<br>
      Direct exercises: {{ getDirectExercisesCount(learningGoal) }}<br>
      All descendant exercises: {{ getAllDescendantExercisesCount(learningGoal) }}<br>
      Direct parents: {{ getDirectParentsCount(learningGoal) }}<br>
      All ancestors: {{ getAllAncestorsCount(learningGoal) }}
    </div>
    <button v-if="learningGoal.children.length" class="btn btn-xs mt-1" @click="expanded = !expanded">
      {{ expanded ? 'Hide' : 'Show' }} children
    </button>
    <div v-if="expanded" class="ml-4 mt-2 space-y-2">
      <LearningGoalWidget
        v-for="child in learningGoal.children"
        :key="child.name"
        :learning-goal="child"
        :get-direct-children-count="getDirectChildrenCount"
        :get-all-descendants-count="getAllDescendantsCount"
        :get-direct-exercises-count="getDirectExercisesCount"
        :get-all-descendant-exercises-count="getAllDescendantExercisesCount"
        :get-direct-parents-count="getDirectParentsCount"
        :get-all-ancestors-count="getAllAncestorsCount"
      />
    </div>
  </div>
</template>
