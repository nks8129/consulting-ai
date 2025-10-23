# 🚀 Quick Deploy to Vercel - 20 Minutes

## Prerequisites

Before deploying, you need:
1. ✅ Supabase database set up - **[Follow SUPABASE_SETUP.md first](./SUPABASE_SETUP.md)** (10-15 min)
2. ✅ OpenAI API key
3. ✅ GitHub account

---

## Step 1: Push to GitHub (2 minutes)

```bash
# If you haven't already, initialize git
git init
git add .
git commit -m "Initial commit: Consulting AI"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/consulting-ai.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel (3 minutes)

### Option A: One-Click Deploy 🎯

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repository
3. **Configure**:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
4. **Add Environment Variables** (3 required):
   - Name: `OPENAI_API_KEY` | Value: `sk-your-actual-key-here`
   - Name: `SUPABASE_URL` | Value: `https://xxxxx.supabase.co`
   - Name: `SUPABASE_KEY` | Value: `eyJhbGci...` (your anon key)
5. **Click Deploy** ✨

### Option B: Using CLI ⚡

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Add your OpenAI API key when prompted
# Or add it later in Vercel Dashboard → Settings → Environment Variables
```

## Step 3: Done! 🎉

Your app will be live at: `https://your-project-name.vercel.app`

## 🔧 After Deployment

### Add Your OpenAI API Key

If you didn't add it during deployment:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
4. Click **Save**
5. Go to **Deployments** → Click **"..."** → **Redeploy**

### Test Your Deployment

Visit your Vercel URL and:
- ✅ Create an opportunity
- ✅ Add some artifacts
- ✅ Chat with the AI assistant
- ✅ Try the research tool
- ✅ Test dark mode

## 🐛 Troubleshooting

### Build Failed?

**Check the build logs** in Vercel Dashboard → Deployments → Click on failed deployment

Common fixes:
```bash
# Test build locally first
cd frontend
npm install
npm run build

# If that works, push and redeploy
git add .
git commit -m "Fix build"
git push
```

### API Not Working?

1. Check environment variables are set correctly
2. Redeploy after adding variables
3. Check Function Logs in Vercel Dashboard

### Still Having Issues?

See the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed troubleshooting.

## 📊 What You Get (Free Tier)

- ✅ Unlimited projects
- ✅ 100GB bandwidth/month
- ✅ 6,000 build minutes/month
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Preview deployments for PRs

## 🎯 Next Steps

- [ ] Add a custom domain
- [ ] Set up authentication
- [ ] Add a database (Supabase)
- [ ] Monitor usage in OpenAI Dashboard
- [ ] Share with your team!

---

**Need more help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete guide.
