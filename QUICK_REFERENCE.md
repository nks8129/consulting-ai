# ⚡ Quick Reference - Consulting AI

## 🚀 Deploy in 20 Minutes

### Step 1: Supabase Setup (10-15 min)
```bash
1. Go to supabase.com → Create project
2. Copy supabase_schema.sql → Paste in SQL Editor → Run
3. Get API credentials: Settings → API
   - Copy Project URL
   - Copy anon/public key
```

### Step 2: Configure Environment (2 min)
```bash
# backend/.env
OPENAI_API_KEY=sk-your-key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGci...
```

### Step 3: Deploy to Vercel (5 min)
```bash
# Push to GitHub
git add .
git commit -m "Add Supabase integration"
git push

# Deploy
vercel

# Or use Vercel Dashboard:
# 1. Import GitHub repo
# 2. Add 3 env vars (OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY)
# 3. Deploy
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase_schema.sql` | Database schema - run in Supabase SQL Editor |
| `backend/app/supabase_store.py` | Supabase storage implementation |
| `backend/app/main.py` | Auto-detects Supabase or in-memory storage |
| `SUPABASE_SETUP.md` | Complete Supabase setup guide |
| `DEPLOY_QUICK_START.md` | Quick deployment guide |

---

## 🔧 Environment Variables

### Required for Production

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) | `sk-proj-...` |
| `SUPABASE_URL` | Supabase → Settings → API | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase → Settings → API | `eyJhbGci...` |

### Where to Add

**Local Development:**
```bash
backend/.env
```

**Vercel Deployment:**
```
Dashboard → Settings → Environment Variables
```

---

## 🏃 Running Locally

### With Supabase (Persistent)
```bash
# 1. Set up .env with Supabase credentials
# 2. Install dependencies
cd backend && pip install -r requirements.txt
cd ..

# 3. Start app
npm start

# App runs at http://localhost:5172
# Data persists in Supabase ✅
```

### Without Supabase (Temporary)
```bash
# 1. Don't set SUPABASE_URL/KEY in .env
# 2. Start app
npm start

# Data stored in memory (lost on restart) ⚠️
```

---

## 🗄️ Database Schema

### Tables
- `opportunities` - Consulting engagements
- `artifacts` - Documents and notes
- `tasks` - Task management
- `phase_progress` - Phase tracking
- `active_opportunity` - Active opportunity tracker

### Quick Queries

```sql
-- View all opportunities
SELECT * FROM opportunities;

-- View artifacts for an opportunity
SELECT * FROM artifacts WHERE opportunity_id = 'opp_xxxxx';

-- View all tasks
SELECT * FROM tasks;

-- Check active opportunity
SELECT * FROM active_opportunity;
```

---

## 🐛 Common Issues

### "SUPABASE_URL and SUPABASE_KEY must be set"
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_KEY

# If empty, add to backend/.env
# For Vercel: Add in Dashboard → Settings → Environment Variables
```

### "relation 'opportunities' does not exist"
```bash
# Run the SQL schema in Supabase SQL Editor
# File: supabase_schema.sql
```

### Data Not Persisting
```bash
# 1. Verify Supabase env vars are set
# 2. Check backend logs for errors
# 3. Verify schema was created in Supabase
```

### Build Fails on Vercel
```bash
# Test build locally first
cd frontend
npm install
npm run build

# If successful, push and redeploy
git add .
git commit -m "Fix build"
git push
```

---

## 💰 Free Tier Limits

### Supabase
- ✅ 500 MB database
- ✅ Unlimited API requests
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users

### Vercel
- ✅ 100 GB bandwidth/month
- ✅ 6,000 build minutes/month
- ✅ Unlimited deployments

### OpenAI
- 💳 Pay per use (~$0.02-$0.05 per conversation)
- Set usage limits in OpenAI dashboard

---

## 📚 Documentation

| Guide | Purpose | Time |
|-------|---------|------|
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Set up database | 10-15 min |
| [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md) | Deploy to Vercel | 5 min |
| [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) | What changed | 5 min read |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Complete guide | Reference |
| [STORAGE_OPTIONS.md](./STORAGE_OPTIONS.md) | Storage comparison | Reference |

---

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] SQL schema executed
- [ ] API credentials copied
- [ ] Environment variables set (local)
- [ ] Tested locally - data persists
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set (Vercel)
- [ ] Deployed successfully
- [ ] Tested production - data persists
- [ ] Shared URL with team

---

## 🎯 Next Steps After Deployment

1. **Test Everything**
   - Create opportunities
   - Add artifacts
   - Chat with AI
   - Refresh page - data persists ✅

2. **Share Your App**
   - Send Vercel URL to colleagues
   - Add to portfolio
   - Share on social media

3. **Monitor Usage**
   - Supabase Dashboard → Usage
   - Vercel Dashboard → Analytics
   - OpenAI Dashboard → Usage

4. **Future Enhancements**
   - Add authentication
   - Enable Row Level Security
   - Add custom domain
   - Set up monitoring/alerts

---

**Need help?** Check the full guides or open an issue on GitHub!
