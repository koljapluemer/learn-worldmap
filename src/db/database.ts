import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Card } from 'ts-fsrs'

export interface CountryCard extends Card {
  countryName: string;
}

export class GeographyDB extends Dexie {
  countryCards!: Table<CountryCard>;

  constructor() {
    super('GeographyDB');
    this.version(1).stores({
      countryCards: 'countryName, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review'
    });
  }
}

export const db = new GeographyDB(); 