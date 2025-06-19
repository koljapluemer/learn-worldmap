<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LearningGoal } from '../learning-goal/LearningGoalType';
import LearningGoalWidget from './LearningGoalWidget.vue';
import { useLearningGoalProgressStore } from '../tracking/learning-goal-progress/learningGoalProgressStore';

const props = defineProps<{
  learningGoal: LearningGoal,
  getDirectChildrenCount: (goal: LearningGoal) => number,
  getAllDescendantsCount: (goal: LearningGoal) => number,
  getDirectExercisesCount: (goal: LearningGoal) => number,
  getAllDescendantExercisesCount: (goal: LearningGoal) => number,
  getDirectParentsCount: (goal: LearningGoal) => number,
  getAllAncestorsCount: (goal: LearningGoal) => number,
  isEffectivelyBlacklisted: (goal: LearningGoal, isBlacklisted: (name: string) => boolean) => boolean,
  isBlacklisted: (name: string) => boolean,
}>();

const expanded = ref(false);
const progressStore = useLearningGoalProgressStore();

const progress = computed(() => progressStore.getProgress(props.learningGoal.name));
const isDirectlyBlacklisted = computed(() => progress.value?.isBlacklisted ?? false);
const isGreyed = computed(() => props.isEffectivelyBlacklisted(props.learningGoal, props.isBlacklisted));

function toggleBlacklist() {
  progressStore.setProgress({
    ...progress.value,
    learningGoalName: props.learningGoal.name,
    isBlacklisted: !isDirectlyBlacklisted.value,
  });
}
</script>

<template>
  <div :class="['border rounded p-2 bg-base-100', isGreyed ? 'opacity-50 grayscale' : '']">
    {{ props.learningGoal.description }}
    <div class="text-xs text-gray-500 mt-1">
      Direct children: {{ props.getDirectChildrenCount(props.learningGoal) }}<br>
      All descendants: {{ props.getAllDescendantsCount(props.learningGoal) }}<br>
      Direct exercises: {{ props.getDirectExercisesCount(props.learningGoal) }}<br>
      All descendant exercises: {{ props.getAllDescendantExercisesCount(props.learningGoal) }}<br>
      Direct parents: {{ props.getDirectParentsCount(props.learningGoal) }}<br>
      All ancestors: {{ props.getAllAncestorsCount(props.learningGoal) }}<br>
      Interest: {{ props.learningGoal.inherentInterest }}<br>
      Difficulty: {{ props.learningGoal.inherentDifficulty }}
    </div>
    <button class="btn btn-xs mt-1 mr-2" @click="toggleBlacklist">
      {{ isDirectlyBlacklisted ? 'Unblacklist' : 'Blacklist' }}
    </button>
    <button v-if="props.learningGoal.children.length" class="btn btn-xs mt-1" @click="expanded = !expanded">
      {{ expanded ? 'Hide' : 'Show' }} children
    </button>
    <div v-if="expanded" class="ml-4 mt-2 space-y-2">
      <LearningGoalWidget
        v-for="child in props.learningGoal.children"
        :key="child.name"
        :learning-goal="child"
        :get-direct-children-count="props.getDirectChildrenCount"
        :get-all-descendants-count="props.getAllDescendantsCount"
        :get-direct-exercises-count="props.getDirectExercisesCount"
        :get-all-descendant-exercises-count="props.getAllDescendantExercisesCount"
        :get-direct-parents-count="props.getDirectParentsCount"
        :get-all-ancestors-count="props.getAllAncestorsCount"
        :is-effectively-blacklisted="props.isEffectivelyBlacklisted"
        :is-blacklisted="props.isBlacklisted"
      />
    </div>
  </div>
</template>
