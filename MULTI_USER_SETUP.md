# Multi-User Authentication Setup

## Overview
This guide will help you add Google Authentication and make the app multi-user, where each user only sees their own opportunities, artifacts, and conversations.

## Step 1: Enable Google Auth in Supabase

1. **Go to Supabase Dashboard** → Authentication → Providers
2. **Enable Google Provider:**
   - Toggle "Google" to ON
   - Add your Google OAuth credentials:
     - Client ID
     - Client Secret
   - Set Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

3. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: Add your Supabase callback URL
   - Copy Client ID and Client Secret to Supabase

## Step 2: Run Updated Database Schema

**IMPORTANT:** This will modify your existing tables. Backup your data first!

### Option A: Fresh Start (Recommended for Development)
1. Go to Supabase Dashboard → SQL Editor
2. Drop existing tables (if you want to start fresh):
```sql
DROP TABLE IF EXISTS chatkit_thread_items CASCADE;
DROP TABLE IF EXISTS chatkit_threads CASCADE;
DROP TABLE IF EXISTS artifacts CASCADE;
DROP TABLE IF EXISTS phase_progress CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS active_opportunity CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
```

3. Run the entire `supabase_schema.sql` file

### Option B: Migrate Existing Data
1. Add `user_id` columns to existing tables:
```sql
-- Add user_id columns
ALTER TABLE opportunities ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE chatkit_threads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE active_opportunity ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- If you have existing data, assign it to a user (replace with your user ID)
-- UPDATE opportunities SET user_id = 'your-user-uuid';
-- UPDATE tasks SET user_id = 'your-user-uuid';
-- UPDATE chatkit_threads SET user_id = 'your-user-uuid';
-- UPDATE active_opportunity SET user_id = 'your-user-uuid';

-- Make user_id NOT NULL after data migration
ALTER TABLE opportunities ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE chatkit_threads ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE active_opportunity ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint for active_opportunity
ALTER TABLE active_opportunity ADD CONSTRAINT active_opportunity_user_id_key UNIQUE (user_id);
```

2. Then run the RLS policies from `supabase_schema.sql` (lines 82-165)

## Step 3: Update Environment Variables

Add to your `.env` file:
```bash
# Supabase (existing)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# New: Supabase Service Role Key (for backend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get the Service Role Key from: Supabase Dashboard → Settings → API → service_role key

## Step 4: Frontend Changes

The frontend will be updated to:
- Show Google Sign In page
- Store auth token in localStorage
- Pass auth token to backend
- Handle logout
- Redirect unauthenticated users to login

## Step 5: Backend Changes

The backend will be updated to:
- Extract user_id from Supabase JWT token
- Filter all queries by user_id
- Create user-specific active_opportunity records
- Ensure RLS policies are respected

## Step 6: Testing

1. **Sign in with Google**
2. **Create an opportunity** - it should be linked to your user
3. **Sign out and sign in with different Google account**
4. **Verify you don't see the first user's data**
5. **Create opportunity with second user**
6. **Switch back to first user** - should only see their data

## Security Features

✅ **Row Level Security (RLS)** - Database-level security
✅ **User isolation** - Each user only sees their own data
✅ **Cascade deletes** - When user is deleted, all their data is removed
✅ **JWT validation** - Backend validates Supabase tokens
✅ **No shared data** - Opportunities, artifacts, and conversations are private

## What Changes

### Database:
- All tables now have `user_id` column
- RLS policies enforce user isolation
- `active_opportunity` is per-user (not global)

### Frontend:
- Login page with Google Sign In
- Auth state management
- Protected routes
- Logout functionality

### Backend:
- User extraction from JWT
- All queries filtered by user_id
- Service role key for admin operations

## Rollback Plan

If you need to rollback:
1. Disable RLS on all tables
2. Remove user_id columns
3. Restore from backup
4. Redeploy previous version
