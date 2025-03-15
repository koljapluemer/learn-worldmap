<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFlashcards } from '../composables/useFlashcards';
import PracticeCard from '../components/PracticeCard.vue';
import { FlashcardDatabase } from '../services/database';
import type { Flashcard } from '../types';
import { Rating, type Grade } from 'ts-fsrs';

const db = new FlashcardDatabase();
const {
  getDueFlashcards,
  reviewFlashcard
} = useFlashcards();

const currentCard = ref<Flashcard | null>(null);
const isRevealed = ref(false);
const dueCount = ref(0);

onMounted(async () => {
  await loadNextCard();
});

async function loadNextCard() {
  const dueCards = await getDueFlashcards();
  dueCount.value = dueCards.length;
  
  if (dueCards.length === 0) {
    currentCard.value = null;
    return;
  }
  
  // Get a random card from the due cards
  const randomIndex = Math.floor(Math.random() * dueCards.length);
  currentCard.value = dueCards[randomIndex];
  isRevealed.value = false;
}

async function revealCard() {
  isRevealed.value = true;
}

async function scoreCard(grade: Grade) {
  if (!currentCard.value) return;
  
  await reviewFlashcard(currentCard.value.id!, grade);
  await loadNextCard();
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Practice Flashcards</h1>
    
    <PracticeCard
      v-if="currentCard"
      :card="currentCard"
      :is-revealed="isRevealed"
      @reveal="revealCard"
      @score="scoreCard"
    />
    
    <div v-else class="text-center">
      <p class="text-xl mb-4">
        {{ dueCount === 0 ? 'No cards due for review!' : 'Loading next card...' }}
      </p>
      <p v-if="dueCount === 0" class="text-gray-600">
        Come back later to practice more cards.
      </p>
    </div>
  </div>
</template> 