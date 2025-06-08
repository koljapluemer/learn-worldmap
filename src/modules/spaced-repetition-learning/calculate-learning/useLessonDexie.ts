import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import type { LessonCard } from '@/modules/shared-types/types'

interface DeviceInfo {
  id: string;
  deviceId: string;
}

export class LessonDatabase extends Dexie {
  lessonCards!: Table<LessonCard>;
  deviceInfo!: Table<DeviceInfo>;

  constructor() {
    super('LessonDatabase');
    this.version(1).stores({
      lessonCards: 'id, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review',
      deviceInfo: 'id'
    });
  }
}

const db = new LessonDatabase();

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

export function useLessonDexie() {
  const getCard = async (lessonId: string): Promise<LessonCard | undefined> => {
    return await db.lessonCards.get(lessonId);
  }

  const saveCard = async (card: LessonCard): Promise<void> => {
    await db.lessonCards.put(card);
  }

  const deleteCard = async (lessonId: string): Promise<void> => {
    await db.lessonCards.delete(lessonId);
  }

  const getAllCards = async (): Promise<LessonCard[]> => {
    return await db.lessonCards.toArray();
  }

  const getDueCards = async (): Promise<LessonCard[]> => {
    const now = new Date();
    console.log('Checking for due lessons at:', now.toISOString());
    return await db.lessonCards
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
    deleteCard,
    getAllCards,
    getDueCards,
    resetDatabase
  }
} 