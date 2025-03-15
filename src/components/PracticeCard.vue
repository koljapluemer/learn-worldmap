<script setup lang="ts">
import type { Flashcard } from '../types';
import type { Grade } from 'ts-fsrs';
import { Rating } from 'ts-fsrs';

defineProps<{
  card: Flashcard;
  isRevealed: boolean;
}>();

defineEmits<{
  (e: 'reveal'): void;
  (e: 'score', grade: Grade): void;
}>();
</script>

<template>
  <div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
    <div class="card-body">
      <div class="prose max-w-none">
        <p class="text-lg">{{ card.front }}</p>
        
        <div v-if="isRevealed" class="mt-4">
          <p class="text-lg">{{ card.back }}</p>
        </div>
      </div>
      
      <div class="card-actions justify-center mt-4">
        <button
          v-if="!isRevealed"
          class="btn btn-primary"
          @click="$emit('reveal')"
        >
          Reveal Answer
        </button>
        
        <div v-else class="flex flex-row gap-2">
          <button class="btn btn-error" @click="$emit('score', Rating.Again)">
            Wrong
          </button>
          <button class="btn btn-warning" @click="$emit('score', Rating.Hard)">
            Hard
          </button>
          <button class="btn btn-success" @click="$emit('score', Rating.Good)">
            Correct
          </button>
          <button class="btn btn-info" @click="$emit('score', Rating.Easy)">
            Easy
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 