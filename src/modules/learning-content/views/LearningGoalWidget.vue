<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LearningGoal } from '../learning-goal/LearningGoalType';
import LearningGoalWidget from './LearningGoalWidget.vue';
import { useLearningGoalProgressStore } from '../tracking/learning-goal-progress/learningGoalProgressStore';
import { useLearningData } from '../data/useLearningData';

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
  getEffectiveInterest: (goal: LearningGoal) => number,
  getEffectiveDifficulty: (goal: LearningGoal) => number,
}>();

const expanded = ref(false);
const progressStore = useLearningGoalProgressStore();
const { getLearningGoalWithProgress } = useLearningData();

const learningGoalWithProgress = computed(() => 
  getLearningGoalWithProgress(props.learningGoal.name, progressStore)
);

const progress = computed(() => learningGoalWithProgress.value?.progress);
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
    <div class="text-xs">{{ props.learningGoal.name }}</div>
    {{ props.learningGoal.description }}
    
    <!-- Progress Data Box -->
    <div v-if="progress" class="mt-2 p-2 bg-base-200 rounded text-xs">
      <div class="font-semibold mb-1">Progress:</div>
      <div class="grid grid-cols-2 gap-1">
        <div>Last seen: {{ progress.lastSeenAt ? new Date(progress.lastSeenAt).toLocaleDateString() : 'Never' }}</div>
        <div>Repetitions: {{ progress.repetitions || 0 }}</div>
        <div>Streak: {{ progress.streak || 0 }}</div>
        <div>Correct: {{ progress.correctRepetitionCount || 0 }}</div>
        <div>Last correct: 
          <span v-if="progress.lastRepetitionCorrect === true" class="text-success">✓</span>
          <span v-else-if="progress.lastRepetitionCorrect === false" class="text-error">✗</span>
          <span v-else>-</span>
        </div>
        <div v-if="progress.priority !== undefined">Priority: {{ progress.priority }}</div>
      </div>
    </div>
    
    <div class="text-xs text-gray-500 mt-1">
      Direct children: {{ props.getDirectChildrenCount(props.learningGoal) }}<br>
      All descendants: {{ props.getAllDescendantsCount(props.learningGoal) }}<br>
      Direct exercises: {{ props.getDirectExercisesCount(props.learningGoal) }}<br>
      All descendant exercises: {{ props.getAllDescendantExercisesCount(props.learningGoal) }}<br>
      Direct parents: {{ props.getDirectParentsCount(props.learningGoal) }}<br>
      All ancestors: {{ props.getAllAncestorsCount(props.learningGoal) }}<br>
      Interest: {{ props.learningGoal.inherentInterest }}<br>
      Difficulty: {{ props.learningGoal.inherentDifficulty }}<br>
      Effective interest: {{ props.getEffectiveInterest(props.learningGoal) }}<br>
      Effective difficulty: {{ props.getEffectiveDifficulty(props.learningGoal) }}
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
        :get-effective-interest="props.getEffectiveInterest"
        :get-effective-difficulty="props.getEffectiveDifficulty"
      />
    </div>
  </div>
</template>
