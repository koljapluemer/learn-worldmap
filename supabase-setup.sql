-- Create the learning_events table
CREATE TABLE IF NOT EXISTS learning_events (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  exercise_id TEXT NOT NULL,
  ms_from_exercise_to_first_click INTEGER NOT NULL,
  ms_from_exercise_to_finish_click INTEGER NOT NULL,
  number_of_clicks_needed INTEGER NOT NULL,
  distance_of_first_click_to_center_of_country NUMERIC NOT NULL,
  device_id TEXT NOT NULL,
  is_touch_device BOOLEAN NOT NULL,
  learning_goal_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_learning_events_device_id ON learning_events(device_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_exercise_id ON learning_events(exercise_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_learning_goal_name ON learning_events(learning_goal_name);
CREATE INDEX IF NOT EXISTS idx_learning_events_created_at ON learning_events(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from authenticated and anonymous users
-- This allows the app to log events without requiring user authentication
CREATE POLICY "Allow inserts for all users" ON learning_events
  FOR INSERT WITH CHECK (true);

-- Create policy to allow reads for all users (optional, remove if you want to restrict access)
CREATE POLICY "Allow reads for all users" ON learning_events
  FOR SELECT USING (true);

-- Create policy to prevent updates and deletes (data integrity)
CREATE POLICY "Prevent updates and deletes" ON learning_events
  FOR UPDATE USING (false);

CREATE POLICY "Prevent deletes" ON learning_events
  FOR DELETE USING (false);

-- Grant necessary permissions to the anon role
GRANT USAGE ON SEQUENCE learning_events_id_seq TO anon;
GRANT INSERT, SELECT ON learning_events TO anon; 