# 🚀 Deployment Guide - Consulting AI

This guide will help you deploy the Consulting AI app to Vercel with Supabase.

## 📋 Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Supabase Account** - Sign up at [supabase.com](https://supabase.com) (free tier available)
4. **OpenAI API Key** - Get one from [platform.openai.com](https://platform.openai.com)

## ⚡ Quick Start

**For the fastest setup**, follow these guides in order:

1. **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Set up your database (10-15 min)
2. **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)** - Deploy to Vercel (5 min)

**Total time: ~20 minutes** to get your app live with persistent storage!

## 🎯 Option 1: Deploy to Vercel (Recommended)

### Step 1: Push Your Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: Consulting AI app"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/consulting-ai.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from the project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - What's your project's name? consulting-ai
# - In which directory is your code located? ./
# - Want to override the settings? No
```

#### Option B: Using Vercel Dashboard (Easier for beginners)

1. **Go to [vercel.com/new](https://vercel.com/new)**

2. **Import Your GitHub Repository**
   - Click "Import Git Repository"
   - Select your `consulting-ai` repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   ```

5. **Click "Deploy"**
   - Vercel will build and deploy your app
   - Wait 2-3 minutes for the build to complete

6. **Your App is Live! 🎉**
   - You'll get a URL like: `https://consulting-ai-xyz.vercel.app`
   - Share this URL with anyone!

### Step 3: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `consulting-ai.yourdomain.com`)
4. Follow Vercel's DNS configuration instructions

## 🔧 Vercel Configuration Explained

The `vercel.json` file in your project root configures how Vercel deploys your app:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "frontend/dist" }
    },
    {
      "src": "backend/app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    { "src": "/chatkit/(.*)", "dest": "backend/app/main.py" },
    { "src": "/tasks/(.*)", "dest": "backend/app/main.py" },
    { "src": "/opportunities/(.*)", "dest": "backend/app/main.py" },
    { "src": "/(.*)", "dest": "frontend/dist/$1" }
  ]
}
```

This tells Vercel:
- Build the frontend as a static site
- Deploy the backend as serverless Python functions
- Route API calls to the backend, everything else to the frontend

## 🔐 Environment Variables

### Required Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |

### Optional Variables (for future use)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | `eyJhbGc...` |

## 🔄 Updating Your Deployment

Every time you push to GitHub, Vercel automatically redeploys:

```bash
# Make your changes
git add .
git commit -m "Update feature X"
git push

# Vercel will automatically deploy the changes!
```

## 🐛 Troubleshooting

### Build Fails

**Problem**: Build fails with "Module not found"
**Solution**: Make sure all dependencies are in `package.json` and `requirements.txt`

```bash
# Test build locally first
cd frontend
npm install
npm run build

cd ../backend
pip install -r requirements.txt
```

### API Not Working

**Problem**: Frontend loads but API calls fail
**Solution**: Check environment variables

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `OPENAI_API_KEY` is set correctly
3. Redeploy: Deployments → Click "..." → Redeploy

### CORS Errors

**Problem**: Browser shows CORS errors
**Solution**: The backend already has CORS configured in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If issues persist, check browser console for specific errors.

## 📊 Monitoring

### View Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Click "Deployments"
4. Click on a deployment
5. View "Build Logs" or "Function Logs"

### Check Usage

- **Vercel Dashboard** → Analytics
- Monitor API calls, bandwidth, and build minutes
- Free tier includes:
  - 100GB bandwidth/month
  - 6,000 build minutes/month
  - Unlimited API requests

## 💰 Cost Considerations

### Vercel (Hosting)
- **Free Tier**: Perfect for personal projects and demos
- **Pro ($20/month)**: For production apps with more traffic

### OpenAI (API Usage)
- **GPT-4o**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- **o1-mini**: ~$3 per 1M input tokens, ~$12 per 1M output tokens
- Typical conversation: 2,000-5,000 tokens (~$0.02-$0.05)
- Budget: Set limits in OpenAI Dashboard

**Tip**: Add usage monitoring in your OpenAI dashboard to avoid surprises!

## 🎯 Alternative Deployment Options

### Option 2: Netlify

Similar to Vercel, good alternative:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Option 3: Railway

Great for full-stack apps with databases:

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy!

### Option 4: Docker + Cloud Run

For more control:

```bash
# Coming soon: Docker configuration
docker build -t consulting-ai .
docker run -p 8000:8000 consulting-ai
```

## ✅ Post-Deployment Checklist

- [ ] App is accessible via Vercel URL
- [ ] Chat interface loads correctly
- [ ] Can create opportunities
- [ ] Can add artifacts
- [ ] AI assistant responds to messages
- [ ] Research tool works
- [ ] Analysis tool works
- [ ] Dark mode toggle works
- [ ] Mobile responsive design works

## 🎉 You're Live!

Your Consulting AI app is now accessible to anyone with the URL!

**Share your deployment:**
- Send the Vercel URL to colleagues
- Add it to your portfolio
- Share on LinkedIn/Twitter

**Next Steps:**
- Add authentication (Auth0, Clerk, or Supabase Auth)
- Migrate to persistent database (Supabase, PlanetScale)
- Add analytics (Vercel Analytics, Google Analytics)
- Set up monitoring (Sentry for error tracking)

## 📧 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **OpenAI Docs**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **GitHub Issues**: Open an issue in your repository

Happy deploying! 🚀
