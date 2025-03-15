import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Card } from 'ts-fsrs'

export interface CountryCard extends Card {
  countryName: string;
  winStreak: number;
  failStreak: number;
}

class GeographyDB extends Dexie {
  countryCards!: Table<CountryCard>;

  constructor() {
    super('GeographyDB');
    this.version(1).stores({
      countryCards: 'countryName, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review, winStreak, failStreak'
    });
  }
}

const db = new GeographyDB();

export function useDexie() {
  const getCard = async (countryName: string): Promise<CountryCard | undefined> => {
    return await db.countryCards.get(countryName);
  }

  const saveCard = async (card: CountryCard): Promise<void> => {
    await db.countryCards.put(card);
  }

  const getAllCards = async (): Promise<CountryCard[]> => {
    return await db.countryCards.toArray();
  }

  const getDueCards = async (): Promise<CountryCard[]> => {
    const now = new Date();
    console.log('Checking for due cards at:', now.toISOString());
    return await db.countryCards
      .where('due')
      .below(now)
      .toArray();
  }

  const resetDatabase = async (): Promise<void> => {
    await db.delete();
    await db.open();
  }

  return {
    getCard,
    saveCard,
    getAllCards,
    getDueCards,
    resetDatabase
  }
} 