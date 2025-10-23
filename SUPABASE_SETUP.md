# 🗄️ Supabase Setup Guide - Consulting AI

This guide will help you set up Supabase as the database for your Consulting AI app.

## ⏱️ Time Required: 10-15 minutes

---

## Step 1: Create Supabase Project (3 minutes)

### 1.1 Sign Up for Supabase

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub (recommended) or email

### 1.2 Create New Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: `consulting-ai` (or any name you prefer)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: **Free** (500MB database, perfect for this app)
3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes for database to provision

---

## Step 2: Set Up Database Schema (5 minutes)

### 2.1 Open SQL Editor

1. In your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### 2.2 Run the Schema Script

1. Open the file `supabase_schema.sql` in your project root
2. **Copy ALL the contents** of that file
3. **Paste** into the Supabase SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. ✅ You should see "Success. No rows returned"

**What this creates:**
- ✅ `opportunities` table - stores consulting engagements
- ✅ `artifacts` table - stores documents and notes
- ✅ `tasks` table - stores tasks
- ✅ `phase_progress` table - tracks progress through phases
- ✅ `active_opportunity` table - tracks which opportunity is active
- ✅ Indexes for fast queries
- ✅ Helper functions

---

## Step 3: Get API Credentials (2 minutes)

### 3.1 Find Your API Keys

1. In Supabase dashboard, click **"Settings"** (gear icon) in left sidebar
2. Click **"API"** under Project Settings
3. You'll see two important values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```

4. **Keep this tab open** - you'll need these values next!

---

## Step 4: Configure Your App (3 minutes)

### 4.1 Update Local Environment

1. Open `backend/.env` in your project
2. Add your Supabase credentials:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-key

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

3. **Save the file**

### 4.2 Test Locally

```bash
# Install new dependencies
cd backend
pip install -r requirements.txt

# Or if using uv
uv sync

# Start the backend
cd ..
npm start
```

4. Open http://localhost:5172
5. Try creating an opportunity
6. Refresh the page - **data should persist!** ✅

---

## Step 5: Deploy to Vercel (5 minutes)

### 5.1 Add Environment Variables to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project (or import from GitHub if not deployed yet)
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

   | Name | Value |
   |------|-------|
   | `OPENAI_API_KEY` | `sk-your-openai-key` |
   | `SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `SUPABASE_KEY` | `eyJhbGci...` (your anon key) |

5. Click **"Save"**

### 5.2 Deploy

**Option A: Automatic (if already deployed)**
```bash
git add .
git commit -m "Add Supabase integration"
git push
```
Vercel will automatically redeploy with the new environment variables.

**Option B: Manual Deploy**
```bash
vercel --prod
```

### 5.3 Test Your Deployment

1. Visit your Vercel URL (e.g., `https://consulting-ai-xyz.vercel.app`)
2. Create an opportunity
3. Add some artifacts
4. **Refresh the page** - data should still be there! ✅
5. Open in a different browser - you should see the same data! ✅

---

## ✅ Verification Checklist

Test these to make sure everything works:

- [ ] Create a new opportunity
- [ ] Add artifacts to the opportunity
- [ ] Switch between opportunities
- [ ] Refresh the page - data persists
- [ ] Open in incognito/private window - data is there
- [ ] Chat with AI - it can see your opportunities
- [ ] Use research tool
- [ ] Use analysis tool

---

## 🎯 What You Get with Supabase Free Tier

- ✅ **500 MB database** - Stores ~50,000-100,000 opportunities
- ✅ **Unlimited API requests** - No daily limits!
- ✅ **2 GB bandwidth/month** - Plenty for small-medium usage
- ✅ **50,000 monthly active users** - More than enough
- ✅ **Automatic backups** - Daily backups for 7 days
- ✅ **Real-time subscriptions** - For future features
- ✅ **Built-in auth** - When you're ready to add login

---

## 📊 Monitor Your Usage

### Check Database Size

1. Go to Supabase Dashboard
2. Click **"Database"** → **"Database"** in sidebar
3. See storage usage at the top

### Check API Usage

1. Go to **"Settings"** → **"Usage"**
2. View API requests, bandwidth, storage

---

## 🐛 Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_KEY must be set"

**Solution**: Make sure you added the environment variables in Vercel Dashboard and redeployed.

```bash
# Verify locally
echo $SUPABASE_URL
echo $SUPABASE_KEY

# If empty, check your .env file
cat backend/.env
```

### Error: "relation 'opportunities' does not exist"

**Solution**: You didn't run the schema script. Go back to Step 2.

### Error: "Invalid API key"

**Solution**: 
1. Make sure you copied the **anon/public** key, not the service_role key
2. Check for extra spaces or line breaks when pasting
3. Regenerate the key in Supabase if needed

### Data Not Persisting

**Solution**: 
1. Check Vercel logs: Deployments → Click deployment → Function Logs
2. Make sure environment variables are set correctly
3. Verify the schema was created (check Supabase Table Editor)

### Connection Timeout

**Solution**:
1. Check your Supabase project is not paused (free tier pauses after 7 days of inactivity)
2. Wake it up by visiting the Supabase dashboard
3. Redeploy your Vercel app

---

## 🔐 Security Notes

### Current Setup (Development)

- ✅ Using anon/public key - safe for client-side use
- ⚠️ No Row Level Security (RLS) - anyone can read/write all data
- ⚠️ No authentication - no user accounts

### For Production (Future)

When you're ready to add proper security:

1. **Enable Row Level Security (RLS)**
   ```sql
   ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
   ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   ```

2. **Add Authentication**
   - Use Supabase Auth (built-in)
   - Or integrate Auth0, Clerk, etc.

3. **Create Policies**
   ```sql
   -- Example: Users can only see their own opportunities
   CREATE POLICY "Users can view own opportunities"
   ON opportunities FOR SELECT
   USING (auth.uid() = user_id);
   ```

---

## 🎉 You're Done!

Your Consulting AI app now has:
- ✅ Persistent database storage
- ✅ Multi-user support
- ✅ Automatic backups
- ✅ Production-ready infrastructure
- ✅ Room to grow (500MB free!)

### Next Steps

- [ ] Share your app URL with colleagues
- [ ] Add custom domain in Vercel
- [ ] Set up monitoring/alerts
- [ ] Add authentication (when needed)
- [ ] Customize the AI prompts

---

## 📚 Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **Python Client Docs**: [supabase.com/docs/reference/python](https://supabase.com/docs/reference/python)
- **Need Help?**: Open an issue in your GitHub repo

---

**Questions?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide or [STORAGE_OPTIONS.md](./STORAGE_OPTIONS.md) for more details.

Happy deploying! 🚀
