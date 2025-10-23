# 🚀 Setting Up Standalone Consulting AI Repository

## Step 1: Create New Repository Structure

```bash
# 1. Create new directory for clean repo
cd ~/Desktop
mkdir consulting-ai-clean
cd consulting-ai-clean

# 2. Initialize git
git init

# 3. Copy only the consulting-ai app files
cp -r ~/Desktop/newapp2/openai-chatkit-advanced-samples/examples/consulting-ai/backend ./backend
cp -r ~/Desktop/newapp2/openai-chatkit-advanced-samples/examples/consulting-ai/frontend ./frontend
```

## Step 2: Clean Up Unnecessary Files

```bash
# Remove backup files
rm -f backend/app/main_backup.py
rm -f frontend/src/components/WorkingChatKitPanel.tsx

# Remove Python cache
find backend -type d -name "__pycache__" -exec rm -rf {} +
find backend -name "*.pyc" -delete

# Remove node_modules (will reinstall)
rm -rf frontend/node_modules
rm -rf frontend/dist
```

## Step 3: Create Essential Config Files

### `.gitignore`
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
*.egg-info/
dist/
build/

# Node
node_modules/
dist/
.DS_Store
*.log

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### `.env.example` (backend)
```
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here

# Supabase Configuration (for production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Optional: Perplexity for web search
PERPLEXITY_API_KEY=pplx-your-key-here

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### `.env.example` (frontend)
```
# API Configuration
VITE_API_URL=http://localhost:8000

# ChatKit Configuration
VITE_CHATKIT_API_URL=http://localhost:8000/chatkit
```

## Step 4: Update Package Files

### `backend/requirements.txt`
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
openai==1.3.0
pydantic==2.5.0
```

### `frontend/package.json` - Update name
```json
{
  "name": "consulting-ai",
  "version": "1.0.0",
  "description": "AI-powered consulting engagement platform",
  ...
}
```

## Step 5: Create README.md

```markdown
# 🤖 Consulting AI

An intelligent AI-powered platform for managing consulting engagements, capturing insights, and accelerating delivery.

## ✨ Features

- 🎯 **Opportunity Management** - Track consulting engagements through phases
- 📝 **Artifact Capture** - Store meeting notes, requirements, risks, and deliverables
- 🤖 **AI Assistant** - GPT-4o powered agent with context awareness
- 🔍 **Research Tools** - Industry insights and analysis
- 📊 **Phase Tracking** - Pre-assessment → Discovery → Solution Design → Implementation
- 🌙 **Dark Mode** - Professional light/dark themes

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API key

### Backend Setup
\`\`\`bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your OPENAI_API_KEY

# Run server
python -m uvicorn app.main:app --reload --port 8000
\`\`\`

### Frontend Setup
\`\`\`bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Run dev server
npm run dev
\`\`\`

### Access the App
Open http://localhost:5172

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **FastAPI** - Modern Python web framework
- **OpenAI ChatKit** - AI agent framework
- **GPT-4o** - Main conversational model
- **o1-mini** - Advanced reasoning for analysis

### Frontend (React + TypeScript)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **OpenAI ChatKit React** - Chat interface

## 📁 Project Structure

\`\`\`
consulting-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & routes
│   │   ├── chat.py              # AI agent & tools
│   │   ├── constants.py         # Configuration
│   │   ├── opportunity_store.py # Data management
│   │   └── task_store.py        # Task management
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   └── lib/                 # Utilities
│   └── package.json
└── README.md
\`\`\`

## 🔧 Configuration

### AI Models
- **Main Agent**: GPT-4o (conversation & tool orchestration)
- **Research**: GPT-4o (industry insights)
- **Analysis**: o1-mini (deep reasoning & patterns)

### Customization
Edit \`backend/app/constants.py\` to:
- Change AI model
- Modify system instructions
- Adjust phases and workflows

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Vercel + Supabase setup
- Database migration
- Production configuration
- Environment variables

## 📝 License

MIT License - see LICENSE file

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For questions or issues, please open a GitHub issue.
\`\`\`

## Step 6: Initialize Git Repository

```bash
# In consulting-ai-clean directory

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Consulting AI platform

- FastAPI backend with OpenAI ChatKit
- React + TypeScript frontend
- Opportunity and artifact management
- AI-powered research and analysis tools
- Professional UI with dark mode support"

# Create GitHub repository (via GitHub CLI or web)
gh repo create consulting-ai --public --source=. --remote=origin

# Or manually:
# 1. Go to github.com/new
# 2. Create repository named "consulting-ai"
# 3. Run:
git remote add origin https://github.com/YOUR_USERNAME/consulting-ai.git
git branch -M main
git push -u origin main
```

## Step 7: Verify Everything Works

```bash
# Test backend
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload

# Test frontend (new terminal)
cd frontend
npm install
npm run dev
```

## ✅ Checklist

- [ ] New directory created
- [ ] Files copied
- [ ] Backup files removed
- [ ] .gitignore created
- [ ] .env.example files created
- [ ] README.md created
- [ ] Git initialized
- [ ] GitHub repo created
- [ ] Code pushed
- [ ] Backend runs successfully
- [ ] Frontend runs successfully
- [ ] App works end-to-end

## 🎉 You're Ready!

Your clean Consulting AI repository is now ready for:
- ✅ Sharing with team
- ✅ Deployment to Vercel + Supabase
- ✅ Further development
- ✅ Open source (if desired)
