import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import type { LearningEvent } from '../learning-event/LearningEvent'

// Types for the remote logging
interface DeviceInfo {
  deviceId: string
  isTouchDevice: boolean
}

// Supabase client - will be initialized with environment variables
let supabase: ReturnType<typeof createClient> | null = null

// Initialize Supabase client
function initializeSupabase() {
  if (supabase) return supabase

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Remote logging will be disabled.')
    return null
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
  return supabase
}

// Get or generate device ID
function getDeviceId(): string {
  const storageKey = 'device_uuid'
  let deviceId = localStorage.getItem(storageKey)
  
  if (!deviceId) {
    deviceId = uuidv4()
    localStorage.setItem(storageKey, deviceId)
  }
  
  return deviceId
}

// Detect if user is on a touch device
function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Get device information
function getDeviceInfo(): DeviceInfo {
  return {
    deviceId: getDeviceId(),
    isTouchDevice: isTouchDevice()
  }
}

// Log learning event to Supabase
async function logLearningEvent(
  event: LearningEvent,
  learningGoalName: string
): Promise<void> {
  try {
    const supabaseClient = initializeSupabase()
    if (!supabaseClient) {
      console.log('Supabase not configured, skipping remote logging')
      return
    }

    const deviceInfo = getDeviceInfo()
    
    const remoteEvent: Record<string, unknown> = {
      timestamp: event.timestamp,
      exercise_id: event.exerciseId,
      ms_from_exercise_to_first_click: event.msFromExerciseToFirstClick,
      ms_from_exercise_to_finish_click: event.msFromExerciseToFinishClick,
      number_of_clicks_needed: event.numberOfClicksNeeded,
      distance_of_first_click_to_center_of_country: event.distanceOfFirstClickToCenterOfCountry,
      device_id: deviceInfo.deviceId,
      is_touch_device: deviceInfo.isTouchDevice,
      learning_goal_name: learningGoalName,
      created_at: new Date().toISOString()
    }

    const { error } = await supabaseClient
      .from('learning_events')
      .insert(remoteEvent)

    if (error) {
      console.error('Failed to log learning event to Supabase:', error)
    } else {
      console.log('Learning event logged to Supabase successfully')
    }
  } catch (error) {
    console.error('Error logging learning event:', error)
  }
}

export function useRemoteLogging() {
  return {
    logLearningEvent,
    getDeviceInfo,
    getDeviceId,
    isTouchDevice
  }
}
