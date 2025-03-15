import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Card } from 'ts-fsrs'
import { v4 as uuidv4 } from 'uuid'
import { logLearningEventToFirebase } from '../services/firebase'

export interface CountryCard extends Card {
  countryName: string;
  winStreak: number;
  failStreak: number;
  level: number;
}

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

export interface DeviceInfo {
  id: string;
  deviceId: string;
}

class GeographyDB extends Dexie {
  countryCards!: Table<CountryCard>;
  learningEvents!: Table<LearningEvent>;
  deviceInfo!: Table<DeviceInfo>;

  constructor() {
    super('GeographyDB');
    this.version(3).stores({
      countryCards: 'countryName, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review, winStreak, failStreak, level',
      learningEvents: '++id, deviceId, timestamp, country',
      deviceInfo: 'id'
    });
  }
}

const db = new GeographyDB();

// Initialize or get device ID
async function getOrCreateDeviceId(): Promise<string> {
  const deviceInfoKey = 'device';
  let deviceInfo = await db.deviceInfo.get(deviceInfoKey);
  
  if (!deviceInfo) {
    deviceInfo = {
      id: deviceInfoKey,
      deviceId: uuidv4()
    };
    await db.deviceInfo.put(deviceInfo);
  }
  
  return deviceInfo.deviceId;
}

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

  const saveLearningEvent = async (event: Omit<LearningEvent, 'deviceId'>): Promise<void> => {
    const deviceId = await getOrCreateDeviceId();
    const fullEvent = {
      ...event,
      deviceId
    };
    
    // Save to local Dexie database
    await db.learningEvents.add(fullEvent);
    
    // Log to Firebase (don't await - fire and forget)
    logLearningEventToFirebase(fullEvent).catch(error => {
      console.error('Failed to log learning event to Firebase:', error);
    });
  }

  const getLearningEventsForCountry = async (country: string): Promise<LearningEvent[]> => {
    return await db.learningEvents
      .where('country')
      .equals(country)
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
    saveLearningEvent,
    getLearningEventsForCountry,
    resetDatabase
  }
} 