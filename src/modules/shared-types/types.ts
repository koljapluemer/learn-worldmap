import type { Card } from "ts-fsrs";

export interface LearningEvent {
  id?: number;  // Auto-incremented primary key
  deviceId: string;
  timestamp: Date;
  country: string;
  msFromExerciseToFirstClick: number;
  msFromExerciseToFinishClick: number;
  numberOfClicksNeeded: number;
  distanceOfFirstClickToCenterOfCountry: number;
}

export interface CountryCard extends Card {
  countryName: string;
  winStreak: number;
  failStreak: number;
  level: number;
}

