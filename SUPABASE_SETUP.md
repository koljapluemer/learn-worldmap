# Supabase Setup for Remote Logging

This guide will help you set up Supabase to enable remote logging of learning events.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization and enter a project name
4. Set a database password (save this securely)
5. Choose a region close to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Set Up Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace the placeholder values with your actual credentials
4. **Important**: Add `.env` to your `.gitignore` file to keep your credentials secure

## 4. Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql`
3. Paste it into the SQL editor and click "Run"
4. This will create the `learning_events` table with proper permissions

## 5. Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `learning_events` table
3. The table should have the following columns:
   - `id` (primary key)
   - `timestamp`
   - `exercise_id`
   - `ms_from_exercise_to_first_click`
   - `ms_from_exercise_to_finish_click`
   - `number_of_clicks_needed`
   - `distance_of_first_click_to_center_of_country`
   - `device_id`
   - `is_touch_device`
   - `learning_goal_name`
   - `created_at`

## 6. Test the Integration

1. Start your development server: `npm run dev`
2. Complete an exercise in the app
3. Check the browser console for logging messages
4. Check your Supabase dashboard → **Table Editor** → **learning_events** to see if events are being logged

## Security Notes

- The setup uses Row Level Security (RLS) with policies that allow anonymous inserts
- This means users don't need to be authenticated to log events
- The `device_id` helps identify unique devices while maintaining privacy
- No personally identifiable information is logged

## Troubleshooting

### "Supabase credentials not found" warning
- Check that your `.env` file exists and has the correct variable names
- Ensure the environment variables start with `VITE_`
- Restart your development server after adding environment variables

### "Failed to log learning event" error
- Check that the `learning_events` table was created successfully
- Verify the RLS policies are in place
- Check the Supabase dashboard logs for more details

### Events not appearing in the database
- Check the browser console for error messages
- Verify your network connection
- Ensure the Supabase project is active and not paused 