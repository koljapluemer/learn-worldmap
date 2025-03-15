import type { Table } from 'dexie';
import Dexie from 'dexie';
import { createEmptyCard, FSRS, generatorParameters, type Grade } from "ts-fsrs";
import type { Flashcard } from '../types';

export class FlashcardDatabase extends Dexie {
  flashcards!: Table<Flashcard>;
  private fsrs: FSRS;

  constructor() {
    super('flashcardDB');
    this.version(2).stores({
      flashcards: '++id, front, back, card.due, card.stability, card.difficulty, card.elapsed_days, card.scheduled_days, card.reps, card.lapses, card.state, lastReviewDate'
    });
    const params = generatorParameters({ enable_fuzz: true });
    this.fsrs = new FSRS(params);
  }

  async addFlashcard(front: string, back: string): Promise<number> {
    const card = createEmptyCard();
    const flashcard: Flashcard = {
      front,
      back,
      card,
    };
    return await this.flashcards.add(flashcard);
  }

  async getDueFlashcards(): Promise<Flashcard[]> {
    const now = new Date();
    return await this.flashcards
      .where('card.due')
      .belowOrEqual(now)
      .toArray();
  }

  async reviewFlashcard(id: number, grade: Grade): Promise<void> {
    const flashcard = await this.flashcards.get(id);
    if (!flashcard) return;

    const result = this.fsrs.next(flashcard.card, new Date(), grade);
    
    await this.flashcards.update(id, {
      card: result.card,
      lastReviewDate: new Date(),
    });
  }

  async deleteFlashcard(id: number): Promise<void> {
    await this.flashcards.delete(id);
  }

  async updateFlashcard(id: number, front: string, back: string): Promise<void> {
    await this.flashcards.update(id, { front, back });
  }

  async resetDatabase(): Promise<void> {
    await this.delete();
    await this.open();
  }
} 