import { describe, it, expect, vi } from 'vitest';
import { useFlashcards } from '../useFlashcards';
import { FlashcardDatabase } from '../../services/database';
import { createEmptyCard } from 'ts-fsrs';

// Simple mock of the database
vi.mock('../../services/database', () => ({
  FlashcardDatabase: vi.fn().mockImplementation(() => ({
    flashcards: {
      toArray: vi.fn().mockResolvedValue([
        { id: 1, front: 'test1', back: 'answer1', card: createEmptyCard() }
      ])
    }
  }))
}));

describe('useFlashcards', () => {
  it('should load flashcards', async () => {
    const { flashcards, loadFlashcards } = useFlashcards();
    await loadFlashcards();
    
    expect(flashcards.value).toHaveLength(1);
    expect(flashcards.value[0]).toEqual({
      id: 1,
      front: 'test1',
      back: 'answer1',
      card: expect.any(Object)
    });
  });
}); 