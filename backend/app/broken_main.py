"""Minimal working FastAPI entrypoint based on customer support pattern."""

from __future__ import annotations

from typing import Any, AsyncIterator

from agents import RunConfig, Runner
from agents.model_settings import ModelSettings
from chatkit.agents import AgentContext, stream_agent_response
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.types import (
    Attachment,
    ClientToolCallItem,
    ThreadMetadata,
    ThreadStreamEvent,
    UserMessageItem,
)
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from openai.types.responses import ResponseInputContentParam
from starlette.responses import JSONResponse

from .memory_store import MemoryStore
from .simple_agent import consulting_agent
from .consulting_models import opportunity_store

DEFAULT_THREAD_ID = "consulting_default_thread"


def _user_message_text(item: UserMessageItem) -> str:
    parts: list[str] = []
    for part in item.content:
        text = getattr(part, "text", None)
        if text:
            parts.append(text)
    return " ".join(parts).strip()


def _is_tool_completion_item(item: Any) -> bool:
    return isinstance(item, ClientToolCallItem)


class ConsultingServer(ChatKitServer[dict[str, Any]]):
    def __init__(self) -> None:
        store = MemoryStore()
        super().__init__(store)
        self.store = store
        self.agent = consulting_agent

    def _resolve_thread_id(self, thread: ThreadMetadata | None) -> str:
        return thread.id if thread and thread.id else DEFAULT_THREAD_ID

    async def respond(
        self,
        thread: ThreadMetadata,
        item: UserMessageItem | None,
        context: dict[str, Any],
    ) -> AsyncIterator[ThreadStreamEvent]:
        if item is None:
            return

        if _is_tool_completion_item(item):
            return

        message_text = _user_message_text(item)
        if not message_text:
            return

        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )
        
        result = Runner.run_streamed(
            self.agent,
            message_text,
            context=agent_context,
            run_config=RunConfig(model_settings=ModelSettings(temperature=0.4)),
        )

        async for event in stream_agent_response(agent_context, result):
            yield event

    async def to_message_content(self, _input: Attachment) -> ResponseInputContentParam:
        raise RuntimeError("File attachments are not supported in this demo.")


consulting_server = ConsultingServer()

app = FastAPI(title="Consulting AI Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_server() -> ConsultingServer:
    return consulting_server


@app.post("/chatkit")
async def chatkit_endpoint(
    request: Request, server: ConsultingServer = Depends(get_server)
) -> Response:
    payload = await request.body()
    result = await server.process(payload, {"request": request})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    if hasattr(result, "json"):
        return Response(content=result.json, media_type="application/json")
    return JSONResponse(result)


@app.get("/opportunities")
async def list_opportunities() -> dict[str, Any]:
    """List all consulting opportunities."""
    opportunities = await opportunity_store.list_active()
    return {
        "opportunities": [opp.as_dict() for opp in opportunities],
        "count": len(opportunities)
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
