<script setup lang="ts">
import { onMounted } from 'vue';
import { useFlashcards } from '../composables/useFlashcards';
import FlashcardForm from '../components/FlashcardForm.vue';
import FlashcardCard from '../components/FlashcardCard.vue';

const {
  flashcards,
  newFront,
  newBack,
  editingCard,
  loadFlashcards,
  addFlashcard,
  deleteFlashcard,
  startEdit,
  saveEdit,
  cancelEdit
} = useFlashcards();

onMounted(async () => {
  await loadFlashcards();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Manage Flashcards</h1>
    
    <!-- Add new flashcard -->
    <FlashcardForm
      v-model:front="newFront"
      v-model:back="newBack"
      submit-label="Add Card"
      @submit="addFlashcard"
    />

    <!-- Flashcard list -->
    <div class="grid gap-4 mt-6">
      <template v-if="editingCard">
        <FlashcardForm
          v-model:front="editingCard.front"
          v-model:back="editingCard.back"
          submit-label="Save"
          @submit="saveEdit"
        />
        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost" @click="cancelEdit">Cancel</button>
        </div>
      </template>
      <FlashcardCard
        v-for="card in flashcards"
        v-else
        :key="card.id"
        :card="card"
        :show-actions="true"
        @edit="startEdit(card)"
        @delete="deleteFlashcard(card.id!)"
      />
    </div>
  </div>
</template> 