"""
Vercel serverless function entry point for the FastAPI backend.
This file adapts the FastAPI app to work with Vercel's serverless functions.
"""
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app
from mangum import Mangum

# Mangum adapter for AWS Lambda/Vercel
handler = Mangum(app, lifespan="off")

# Vercel requires the handler to be the default export
def handler_wrapper(event, context):
    return handler(event, context)
