import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { logLearningEventToFirebase } from '../log-learning/firebase'
import type { ExerciseCard, LearningEvent } from '@/modules/shared-types/types';


interface DeviceInfo {
  id: string;
  deviceId: string;
}

export class ExerciseDatabase extends Dexie {
  exerciseCards!: Table<ExerciseCard>;
  learningEvents!: Table<LearningEvent>;
  deviceInfo!: Table<DeviceInfo>;

  constructor() {
    super('ExerciseDatabase_v2');
    this.version(1).stores({
      exerciseCards: 'exerciseId, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review, learning_steps',
      learningEvents: '++id, deviceId, timestamp, exerciseId',
      dailyChallenges: 'date',
      deviceInfo: 'id'
    });
  }
}

const db = new ExerciseDatabase();

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
  const getCard = async (exerciseId: string): Promise<ExerciseCard | undefined> => {
    return await db.exerciseCards.get(exerciseId);
  }

  const saveCard = async (card: ExerciseCard): Promise<void> => {
    await db.exerciseCards.put(card);
  }

  const deleteCard = async (exerciseId: string): Promise<void> => {
    await db.exerciseCards.delete(exerciseId);
  }

  const getAllCards = async (): Promise<ExerciseCard[]> => {
    return await db.exerciseCards.toArray();
  }

  const getDueCards = async (): Promise<ExerciseCard[]> => {
    const now = new Date();
    console.log('Checking for due cards at:', now.toISOString());
    return await db.exerciseCards
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

  const getLearningEventsForExercise = async (exerciseId: string): Promise<LearningEvent[]> => {
    return await db.learningEvents
      .where('exerciseId')
      .equals(exerciseId)
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
    getLearningEventsForExercise,
    resetDatabase
  }
} 