"""FastAPI entrypoint for Consulting AI."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass  # python-dotenv not installed

from chatkit.server import StreamingResult
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from starlette.responses import JSONResponse

from .chat import ConsultingAIServer, create_chatkit_server

# Use Supabase if configured, otherwise fall back to in-memory
USE_SUPABASE = os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY")

if USE_SUPABASE:
    from .supabase_store import supabase_task_store as task_store
    from .supabase_store import supabase_opportunity_store as opportunity_store
else:
    from .task_store import task_store
    from .opportunity_store import opportunity_store

app = FastAPI(title="Consulting AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_chatkit_server: ConsultingAIServer = create_chatkit_server()


def get_server() -> ConsultingAIServer:
    return _chatkit_server


@app.post("/chatkit")
async def chatkit_endpoint(
    request: Request, server: ConsultingAIServer = Depends(get_server)
) -> Response:
    payload = await request.body()
    result = await server.process(payload, {"request": request})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    if hasattr(result, "json"):
        return Response(content=result.json, media_type="application/json")
    return JSONResponse(result)


@app.get("/tasks")
async def list_tasks() -> dict[str, Any]:
    tasks = await task_store.list_all()
    return {"tasks": [task.as_dict() for task in tasks]}


@app.get("/opportunities")
async def list_opportunities() -> dict[str, Any]:
    opportunities = await opportunity_store.list_opportunities()
    return {"opportunities": [opp.as_dict() for opp in opportunities]}


@app.get("/opportunities/active")
async def get_active_opportunity() -> dict[str, Any]:
    opp = await opportunity_store.get_active_opportunity()
    if not opp:
        return {"opportunity": None}
    
    # Include artifacts for current phase
    phase_artifacts = opp.get_phase_artifacts()
    
    return {
        "opportunity": opp.as_dict(),
        "phaseArtifacts": [artifact.as_dict() for artifact in phase_artifacts],
        "allArtifacts": [artifact.as_dict() for artifact in opp.artifacts],
    }


@app.post("/opportunities")
async def create_opportunity_api(request: Request) -> dict[str, Any]:
    data = await request.json()
    
    stakeholders = []
    if data.get("stakeholders"):
        stakeholders = [s.strip() for s in data["stakeholders"].split(",") if s.strip()]
    
    opp = await opportunity_store.create_opportunity(
        name=data["name"],
        client_name=data["clientName"],
        description=data["description"],
        stakeholders=stakeholders,
    )
    
    return {"opportunity": opp.as_dict()}


@app.post("/opportunities/{opp_id}/activate")
async def set_active_opportunity(opp_id: str) -> dict[str, Any]:
    success = await opportunity_store.set_active_opportunity(opp_id)
    if not success:
        return {"error": "Opportunity not found"}
    
    opp = await opportunity_store.get_opportunity(opp_id)
    return {"opportunity": opp.as_dict() if opp else None}


@app.post("/opportunities/{opp_id}/artifacts")
async def add_artifact_to_opportunity(opp_id: str, request: Request) -> dict[str, Any]:
    """Add an artifact to an opportunity."""
    data = await request.json()
    
    # Use the opportunity_store method to add artifact
    artifact = await opportunity_store.add_artifact_to_opportunity(
        opp_id=opp_id,
        title=data["title"],
        content=data["content"],
        artifact_type=data["type"],
        phase=data["phase"],
        tags=data.get("tags", []),
    )
    
    if not artifact:
        return {"error": "Failed to add artifact"}
    
    # Get updated opportunity
    opp = await opportunity_store.get_opportunity(opp_id)
    
    return {
        "success": True,
        "artifact": artifact.as_dict(),
        "opportunity": opp.as_dict() if opp else None,
    }


@app.post("/opportunities/{opp_id}/phase")
async def change_opportunity_phase(opp_id: str, request: Request) -> dict[str, Any]:
    """Change the current phase of an opportunity."""
    data = await request.json()
    phase = data.get("phase")
    
    if not phase:
        return {"error": "Phase is required"}
    
    opp = await opportunity_store.get_opportunity(opp_id)
    if not opp:
        return {"error": "Opportunity not found"}
    
    # Update phase
    from .opportunity_store import OpportunityPhase
    try:
        opp.current_phase = OpportunityPhase(phase)
    except ValueError:
        return {"error": f"Invalid phase: {phase}"}
    
    return {
        "success": True,
        "opportunity": opp.as_dict(),
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
