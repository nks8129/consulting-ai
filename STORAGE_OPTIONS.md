# 💾 Storage Options for Consulting AI

## Current State: In-Memory Storage ⚠️

Your app currently stores all data in Python dictionaries (RAM):
- **Opportunities** → `Dict[str, Opportunity]`
- **Tasks** → `Dict[str, Task]`
- **Artifacts** → Stored within opportunities

### Problem with Vercel Serverless

**Vercel serverless functions are stateless:**
- Each request may hit a different server instance
- Memory is cleared after ~10 seconds of inactivity
- No shared memory between function instances

**What this means:**
- ❌ Data disappears on page refresh
- ❌ Different users see different data
- ❌ Not suitable for production use

---

## 🎯 Solution 1: Deploy for Demo (No Database)

**Use Case**: Quick demo, testing, portfolio showcase

### What You Get
- ✅ Works for single-user, single-session demos
- ✅ Zero setup, deploy immediately
- ✅ Free
- ⚠️ Data lost on refresh/timeout

### How to Deploy
```bash
# Just deploy as-is
vercel
```

### Add Warning Banner
I can add a banner to the UI warning users that data is temporary.

**Best for**: Portfolio demos, quick testing, showing to 1-2 people

---

## 🎯 Solution 2: Vercel KV (Redis) - Quick Fix

**Use Case**: Small projects, prototypes, personal use

### What You Get
- ✅ Persistent storage
- ✅ Fast (Redis-based)
- ✅ Minimal code changes
- ✅ Free tier: 256MB, 10K requests/day
- ✅ Still fully on Vercel

### Setup (15 minutes)

1. **Enable Vercel KV**
   ```bash
   # In Vercel Dashboard
   # Storage → Create KV Database
   # Link to your project
   ```

2. **Update Code** (I can do this for you)
   ```python
   # Replace in-memory dicts with Vercel KV
   from vercel_kv import kv
   
   # Store opportunity
   await kv.set(f"opp:{opp_id}", opp.as_dict())
   
   # Get opportunity
   data = await kv.get(f"opp:{opp_id}")
   ```

3. **Deploy**
   ```bash
   vercel
   ```

### Cost
- **Free tier**: 256MB storage, 10K requests/day
- **Pro tier**: $1/month for 1GB + 100K requests

**Best for**: Personal projects, small teams (<10 users), prototypes

---

## 🎯 Solution 3: Supabase (PostgreSQL) - Production Ready ⭐

**Use Case**: Production apps, multiple users, long-term projects

### What You Get
- ✅ Real PostgreSQL database
- ✅ Persistent, reliable storage
- ✅ SQL queries, relationships, indexes
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Free tier: 500MB database, 2GB bandwidth
- ✅ Automatic backups

### Setup (30 minutes)

#### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project (free)
3. Wait 2 minutes for database to provision

#### Step 2: Create Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Opportunities table
CREATE TABLE opportunities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  description TEXT,
  current_phase TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_summary TEXT,
  stakeholders TEXT[], -- Array of stakeholder names
  key_insights TEXT[]  -- Array of insights
);

-- Artifacts table
CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  phase TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[]
);

-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_artifacts_opportunity ON artifacts(opportunity_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_tasks_phase ON tasks(phase);
```

#### Step 3: Update Backend Code

Install Supabase client:
```bash
cd backend
pip install supabase
```

Update `requirements.txt`:
```txt
supabase>=2.0.0
```

Create `backend/app/supabase_store.py`:
```python
from supabase import create_client, Client
import os

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class SupabaseOpportunityStore:
    async def create_opportunity(self, name, client_name, description):
        data = {
            "name": name,
            "client_name": client_name,
            "description": description,
            "current_phase": "pre_assessment",
            "status": "active"
        }
        result = supabase.table("opportunities").insert(data).execute()
        return result.data[0]
    
    async def get_opportunity(self, opp_id):
        result = supabase.table("opportunities").select("*").eq("id", opp_id).execute()
        return result.data[0] if result.data else None
    
    # ... more methods
```

#### Step 4: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

#### Step 5: Deploy
```bash
vercel
```

### Cost
- **Free tier**: 500MB database, 2GB bandwidth, 50K monthly active users
- **Pro tier**: $25/month for 8GB database, 250GB bandwidth

**Best for**: Production apps, multiple users, data you want to keep

---

## 📊 Comparison Table

| Feature | In-Memory | Vercel KV | Supabase |
|---------|-----------|-----------|----------|
| **Setup Time** | 0 min | 15 min | 30 min |
| **Persistence** | ❌ Lost on refresh | ✅ Persistent | ✅ Persistent |
| **Multi-user** | ❌ No | ✅ Yes | ✅ Yes |
| **Free Tier** | ✅ Unlimited | ⚠️ 256MB | ✅ 500MB |
| **Queries** | ❌ Limited | ⚠️ Basic | ✅ Full SQL |
| **Auth** | ❌ No | ❌ No | ✅ Built-in |
| **Backups** | ❌ No | ⚠️ Manual | ✅ Automatic |
| **Best For** | Demos | Prototypes | Production |

---

## 🎯 My Recommendation

### For Your Use Case:

**If you want to share with people:**
→ **Use Supabase** (30 min setup, production-ready)

**If you just want to demo quickly:**
→ **Deploy as-is** with a warning banner (I can add this)

**If you want something in between:**
→ **Use Vercel KV** (15 min setup, good for small projects)

---

## 🚀 Next Steps

**Tell me which option you prefer:**

1. **"Deploy for demo"** - I'll add a warning banner and you can deploy immediately
2. **"Use Vercel KV"** - I'll refactor the storage code to use Redis
3. **"Use Supabase"** - I'll help you set up the database and refactor the code

I can implement any of these for you! Which would you like? 🤔
