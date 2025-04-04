import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { logLearningEventToFirebase } from '../log-learning/firebase'
import type { CountryCard, LearningEvent } from '@/modules/shared-types/types';


interface DeviceInfo {
  id: string;
  deviceId: string;
}

export class GeographyDatabase extends Dexie {
  countryCards!: Table<CountryCard>;
  learningEvents!: Table<LearningEvent>;
  deviceInfo!: Table<DeviceInfo>;

  constructor() {
    super('GeographyDatabase');
    this.version(3).stores({
      countryCards: 'countryName, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review, winStreak, failStreak, level',
      learningEvents: '++id, deviceId, timestamp, country',
      dailyChallenges: 'date',
      deviceInfo: 'id'
    });
  }
}

const db = new GeographyDatabase();

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

  const deleteCard = async (countryName: string): Promise<void> => {
    await db.countryCards.delete(countryName);
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
    deleteCard,
    getAllCards,
    getDueCards,
    saveLearningEvent,
    getLearningEventsForCountry,
    resetDatabase
  }
} 