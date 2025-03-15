<script setup lang="ts">
import type { Flashcard } from '../types';

defineProps<{
  card: Flashcard;
  isEditing?: boolean;
  showActions?: boolean;
}>();

defineEmits<{
  (e: 'edit'): void;
  (e: 'delete'): void;
}>();
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="prose">
        <p><strong>Front:</strong> {{ card.front }}</p>
        <p><strong>Back:</strong> {{ card.back }}</p>
        <p v-if="card.lastReviewDate">
          <strong>Last Review:</strong> {{ new Date(card.lastReviewDate).toLocaleDateString() }}
        </p>
      </div>
      <div v-if="showActions" class="card-actions justify-end gap-2">
        <button class="btn btn-ghost" @click="$emit('edit')">Edit</button>
        <button class="btn btn-error" @click="$emit('delete')">Delete</button>
      </div>
    </div>
  </div>
</template> 