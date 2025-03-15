import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import type { LearningEvent } from "@/composables/useDexie";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function logLearningEventToFirebase(event: LearningEvent): Promise<void> {
  try {
    const learningEventsRef = collection(db, "learning-data-webgame");
    await addDoc(learningEventsRef, {
      ...event,
      timestamp: event.timestamp.toISOString(), // Convert Date to ISO string for Firestore
    });
  } catch (error) {
    console.error("Error logging learning event to Firebase:", error);
    // Just log the error but don't throw - we don't want Firebase errors to affect the app
  }
} 