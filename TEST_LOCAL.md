# 🧪 Testing Consulting AI Locally

## ✅ Backend Test

```bash
cd ~/Desktop/consulting-ai-clean/backend

# 1. Activate virtual environment
source .venv/bin/activate

# 2. Add your OpenAI API key to .env
# Edit .env and add: OPENAI_API_KEY=sk-your-key-here

# 3. Start the backend server
python -m uvicorn app.main:app --reload --port 8000

# Expected output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

## ✅ Frontend Test

Open a **new terminal**:

```bash
cd ~/Desktop/consulting-ai-clean/frontend

# 1. Install dependencies (first time only)
npm install

# 2. Start the dev server
npm run dev

# Expected output:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5172/
```

## 🎯 Access the App

Open your browser to: **http://localhost:5172**

You should see:
- ✅ Opportunity selector screen
- ✅ Ability to create new opportunity
- ✅ Chat interface
- ✅ Dark/light mode toggle

## 🐛 Troubleshooting

### Backend Issues

**Error: "No module named 'app'"**
```bash
# Make sure you're in the backend directory
cd ~/Desktop/consulting-ai-clean/backend
python -m uvicorn app.main:app --reload
```

**Error: "OPENAI_API_KEY not found"**
```bash
# Edit .env file
nano .env
# Add: OPENAI_API_KEY=sk-your-actual-key
```

**Port 8000 already in use**
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9
# Or use different port
python -m uvicorn app.main:app --reload --port 8001
```

### Frontend Issues

**Error: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port 5172 already in use**
```bash
# Kill existing process
lsof -ti:5172 | xargs kill -9
# Or Vite will auto-assign next available port
```

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5172
- [ ] Can create a new opportunity
- [ ] Can chat with AI
- [ ] Can add artifacts
- [ ] Can switch phases
- [ ] Dark mode works
- [ ] Toast notifications appear

## 🎉 All Working?

Your app is ready to:
- ✅ Push to GitHub
- ✅ Deploy to Vercel + Supabase
- ✅ Share with team
