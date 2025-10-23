"""
Vercel serverless function entry point for the FastAPI backend.
"""
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app

# For Vercel, we need to export the FastAPI app directly
# Vercel's Python runtime will handle the ASGI interface
app = app
