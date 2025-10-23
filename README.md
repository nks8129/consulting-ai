# 🤖 Consulting AI

An intelligent AI-powered platform for managing consulting engagements, capturing insights, and accelerating delivery.

## ✨ Features

- 🎯 **Opportunity Management** - Track consulting engagements through phases
- 📝 **Artifact Capture** - Store meeting notes, requirements, risks, and deliverables
- 🤖 **AI Assistant** - GPT-4o powered agent with context awareness
- 🔍 **Research Tools** - Industry insights and analysis with GPT-4o
- 🧠 **Advanced Analysis** - o1-mini for deep reasoning and pattern recognition
- 📊 **Phase Tracking** - Pre-assessment → Discovery → Solution Design → Implementation
- 🌙 **Dark Mode** - Professional light/dark themes
- 🎨 **Modern UI** - Responsive design with TailwindCSS

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API key

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env

# Run dev server
npm run dev
```

### Access the App
Open http://localhost:5172 in your browser

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **FastAPI** - Modern Python web framework
- **OpenAI ChatKit** - AI agent framework
- **GPT-4o** - Main conversational model & research
- **o1-mini** - Advanced reasoning for artifact analysis

### Frontend (React + TypeScript)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first styling
- **OpenAI ChatKit React** - Chat interface components

## 📁 Project Structure

```
consulting-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & API routes
│   │   ├── chat.py              # AI agent, tools & context injection
│   │   ├── constants.py         # Configuration & system prompts
│   │   ├── opportunity_store.py # Opportunity & artifact management
│   │   └── task_store.py        # Task management
│   ├── requirements.txt         # Python dependencies
│   └── .env.example            # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Home.tsx
│   │   │   ├── ChatKitPanel.tsx
│   │   │   ├── OpportunityDrawer.tsx
│   │   │   ├── AddArtifactModal.tsx
│   │   │   └── Toast.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   └── lib/                 # Utilities & config
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔧 Configuration

### AI Models
Configure in `backend/app/constants.py`:

- **Main Agent**: `gpt-4o` - Conversation & tool orchestration
- **Research Tool**: `gpt-4o` - Industry insights & trends
- **Analysis Tool**: `o1-mini` - Deep reasoning & pattern analysis

### Customization
Edit `backend/app/constants.py` to:
- Change AI models
- Modify system instructions
- Adjust phases and workflows
- Customize artifact types

## 🎯 Key Features

### Opportunity Management
- Create and track consulting engagements
- Multi-phase workflow support
- Stakeholder tracking
- Progress monitoring

### Artifact Capture
- **Meeting Notes** - Capture client discussions
- **Pain Points** - Document problems identified
- **Requirements** - Track functional/technical needs
- **Process Maps** - Current/future state processes
- **Risks/Blockers** - Identify dependencies
- **Deliverables** - Final outputs (BRD, specs)
- **Stakeholder Notes** - Feedback and input
- **Other** - Flexible documentation

### AI Capabilities
- **Context-Aware** - AI sees all captured artifacts
- **Research** - Industry trends and best practices
- **Analysis** - Deep insights from captured data
- **Search** - Find relevant artifacts by keyword/tag

## 🚀 Deployment

### Option 1: Vercel + Supabase (Recommended)
- Frontend: Vercel
- Backend: Vercel Serverless Functions
- Database: Supabase PostgreSQL
- Cost: Free tier available

### Option 2: Docker
```bash
# Coming soon: Docker Compose setup
docker-compose up
```

### Option 3: AWS/GCP
- Frontend: S3 + CloudFront / Cloud Storage
- Backend: ECS/EKS / Cloud Run
- Database: RDS / Cloud SQL

## 🔐 Security Notes

**Current State**: Development mode with in-memory storage

**For Production**:
- [ ] Add authentication (JWT/OAuth)
- [ ] Migrate to persistent database (PostgreSQL)
- [ ] Add rate limiting
- [ ] Secure API keys (environment variables)
- [ ] Add HTTPS
- [ ] Add input validation
- [ ] Add user permissions

## 📝 Development

### Backend Development
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Code Style
- Backend: Follow PEP 8
- Frontend: ESLint + Prettier
- TypeScript: Strict mode enabled

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Verify OPENAI_API_KEY in `.env`
- Check port 8000 is available

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Delete `node_modules` and run `npm install` again
- Check port 5172 is available

### AI not responding
- Verify OPENAI_API_KEY is valid
- Check backend logs for errors
- Ensure backend is running on port 8000

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For questions or issues:
- Open a GitHub issue
- Check existing issues for solutions

## 🙏 Acknowledgments

Built with:
- [OpenAI ChatKit](https://github.com/openai/openai-chatkit)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
