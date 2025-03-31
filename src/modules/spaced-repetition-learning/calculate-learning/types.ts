import type { Card } from 'ts-fsrs';

export interface Flashcard {
    id?: number;
    front: string;
    back: string;
    card: Card;
    lastReviewDate?: Date;
  }
  