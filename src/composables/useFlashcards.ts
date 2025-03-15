import { ref } from 'vue';
import { FlashcardDatabase } from '../services/database';
import type { Flashcard } from '../types';
import type { Grade } from 'ts-fsrs';

export function useFlashcards() {
  const db = new FlashcardDatabase();
  const flashcards = ref<Flashcard[]>([]);
  const newFront = ref('');
  const newBack = ref('');
  const editingCard = ref<Flashcard | null>(null);

  async function loadFlashcards() {
    flashcards.value = await db.flashcards.toArray();
  }

  async function addFlashcard() {
    if (!newFront.value.trim() || !newBack.value.trim()) return false;
    
    await db.addFlashcard(newFront.value, newBack.value);
    newFront.value = '';
    newBack.value = '';
    await loadFlashcards();
    return true;
  }

  async function deleteFlashcard(id: number) {
    await db.deleteFlashcard(id);
    await loadFlashcards();
  }

  async function startEdit(card: Flashcard) {
    editingCard.value = { ...card };
  }

  async function saveEdit() {
    if (!editingCard.value) return false;
    await db.updateFlashcard(
      editingCard.value.id!,
      editingCard.value.front,
      editingCard.value.back
    );
    editingCard.value = null;
    await loadFlashcards();
    return true;
  }

  function cancelEdit() {
    editingCard.value = null;
  }

  async function getDueFlashcards() {
    return await db.getDueFlashcards();
  }

  async function reviewFlashcard(id: number, grade: Grade) {
    await db.reviewFlashcard(id, grade);
  }

  return {
    flashcards,
    newFront,
    newBack,
    editingCard,
    loadFlashcards,
    addFlashcard,
    deleteFlashcard,
    startEdit,
    saveEdit,
    cancelEdit,
    getDueFlashcards,
    reviewFlashcard
  };
} 