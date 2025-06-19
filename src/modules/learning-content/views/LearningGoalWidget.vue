<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LearningGoal } from '../learning-goal/LearningGoalType';
import LearningGoalWidget from './LearningGoalWidget.vue';
import { useLearningGoalProgressStore } from '../tracking/learning-goal-progress/learningGoalProgressStore';
import { useLearningData } from '../data/useLearningData';
import { useExerciseProgressStore } from '../tracking/exercise/exerciseProgressStore';
import IconLockClosed from '@/modules/icons/IconLockClosed.vue';
import IconLockOpen from '@/modules/icons/IconLockOpen.vue';

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
const exerciseProgressStore = useExerciseProgressStore();
const { getLearningGoalWithProgress, getExerciseStatisticsForLearningGoal, getEffectiveBlockingStatus } = useLearningData();

const learningGoalWithProgress = computed(() => 
  getLearningGoalWithProgress(props.learningGoal.name, progressStore)
);

const progress = computed(() => learningGoalWithProgress.value?.progress);
const isDirectlyBlacklisted = computed(() => progress.value?.isBlacklisted ?? false);
const isGreyed = computed(() => props.isEffectivelyBlacklisted(props.learningGoal, props.isBlacklisted));

const exerciseStats = computed(() => 
  getExerciseStatisticsForLearningGoal(props.learningGoal, exerciseProgressStore)
);

const blockingStatus = computed(() => 
  getEffectiveBlockingStatus(props.learningGoal, exerciseProgressStore)
);

const isBlocked = computed(() => props.learningGoal.blockedBy.length > 0);
const isEffectivelyBlocked = computed(() => blockingStatus.value.isEffectivelyBlocked);
const blockingGoalsNames = computed(() => 
  blockingStatus.value.blockingGoals.map(blocking => {
    const name = blocking.goal.name;
    return blocking.isLifted ? `<s>${name}</s>` : name;
  }).join(', ')
);

const blockingGoalsDisplay = computed(() => 
  blockingStatus.value.blockingGoals.map(blocking => ({
    name: blocking.goal.name,
    isLifted: blocking.isLifted
  }))
);

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
    <div class="text-xs flex items-center gap-1">
      <IconLockClosed v-if="isEffectivelyBlocked" class="w-3 h-3 text-red-500" />
      <IconLockOpen v-else-if="isBlocked && !isEffectivelyBlocked" class="w-3 h-3 text-gray-500" />
      {{ props.learningGoal.name }}
    </div>
    {{ props.learningGoal.description }}
    
    <!-- Blocked By Information -->
    <div v-if="isBlocked" class="mt-1 p-1 bg-red-50 border border-red-200 rounded text-xs text-red-700">
      <span class="font-semibold">Blocked by:</span> 
      <span v-for="(blocking, index) in blockingGoalsDisplay" :key="blocking.name">
        <span v-if="index > 0">, </span>
        <span :class="{ 'line-through': blocking.isLifted }">{{ blocking.name }}</span>
      </span>
    </div>
    
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
      
      <hr class="my-2 border-base-300">
      
      <div class="font-semibold mb-1">Exercise Status:</div>
      <div class="grid grid-cols-1 gap-1">
        <div class="text-blue-600">New exercises: {{ exerciseStats.newExercises }} ({{ exerciseStats.percentages.new }}%)</div>
        <div class="text-orange-600">Due now: {{ exerciseStats.dueExercises }} ({{ exerciseStats.percentages.due }}%)</div>
        <div class="text-gray-600">Not due: {{ exerciseStats.notDueExercises }} ({{ exerciseStats.percentages.notDue }}%)</div>
      </div>
    </div>
    
    <!-- Exercise Status Box (when no progress data) -->
    <div v-else class="mt-2 p-2 bg-base-200 rounded text-xs">
      <div class="font-semibold mb-1">Exercise Status:</div>
      <div class="grid grid-cols-1 gap-1">
        <div class="text-blue-600">New exercises: {{ exerciseStats.newExercises }} ({{ exerciseStats.percentages.new }}%)</div>
        <div class="text-orange-600">Due now: {{ exerciseStats.dueExercises }} ({{ exerciseStats.percentages.due }}%)</div>
        <div class="text-gray-600">Not due: {{ exerciseStats.notDueExercises }} ({{ exerciseStats.percentages.notDue }}%)</div>
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
