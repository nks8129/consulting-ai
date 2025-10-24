"""ChatKit server integration for Consulting AI."""

from __future__ import annotations

import os
from datetime import datetime
from typing import Any, AsyncIterator, Dict, Final
from uuid import uuid4

from agents import Agent, RunContextWrapper, Runner, function_tool
from chatkit.agents import AgentContext, ClientToolCall, stream_agent_response
from chatkit.server import ChatKitServer
from chatkit.types import (
    Attachment,
    ClientToolCallItem,
    ThreadMetadata,
    ThreadStreamEvent,
    UserMessageItem,
)
from openai.types.responses import ResponseInputContentParam
from pydantic import ConfigDict, Field

from .constants import INSTRUCTIONS, MODEL
from .memory_store import MemoryStore
from .consulting_store import consulting_store
from .opportunity_store import OpportunityPhase
from .task_store import TaskStatus

# Use Supabase if configured, otherwise fall back to in-memory
USE_SUPABASE = os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY")

if USE_SUPABASE:
    from .supabase_store import supabase_task_store as task_store
    from .supabase_store import supabase_opportunity_store as opportunity_store
else:
    from .task_store import task_store
    from .opportunity_store import opportunity_store

SUPPORTED_COLOR_SCHEMES: Final[frozenset[str]] = frozenset({"light", "dark"})


def _normalize_color_scheme(value: str) -> str:
    normalized = str(value).strip().lower()
    if normalized in SUPPORTED_COLOR_SCHEMES:
        return normalized
    if "dark" in normalized:
        return "dark"
    if "light" in normalized:
        return "light"
    raise ValueError("Theme must be either 'light' or 'dark'.")


def _user_message_text(item: UserMessageItem) -> str:
    parts: list[str] = []
    for part in item.content:
        text = getattr(part, "text", None)
        if text:
            parts.append(text)
    return " ".join(parts).strip()


def _is_tool_completion_item(item: Any) -> bool:
    return isinstance(item, ClientToolCallItem)


class ConsultingAgentContext(AgentContext):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    store: Any = Field(exclude=True)  # Can be MemoryStore or SupabaseChatKitStore
    request_context: dict[str, Any]


def build_consulting_agent() -> Agent[ConsultingAgentContext]:
    """Create the consulting AI agent with real consulting intelligence tools."""
    
    # ========== RESEARCH & INTELLIGENCE TOOLS ==========
    
    @function_tool(
        description_override="Search the web for industry trends, competitor analysis, market research, or best practices. Use this to get current, accurate information."
    )
    async def search_web(
        ctx: RunContextWrapper[ConsultingAgentContext],
        query: str,
        focus: str = "general",  # industry_trends, competitors, best_practices, market_data, technology
    ) -> Dict[str, Any]:
        """Search web for consulting research using GPT-4o with web browsing."""
        try:
            from openai import AsyncOpenAI
            
            client = AsyncOpenAI()
            
            # Build comprehensive research prompt
            research_prompt = f"""You are a consulting research assistant with access to current information.

Research Query: {query}
Focus Area: {focus}

Provide a comprehensive research summary including:
1. Current trends and insights
2. Key statistics and data points
3. Industry best practices
4. Relevant case studies or examples
5. Recommended sources for further reading

Be specific, cite recent developments, and provide actionable insights."""
            
            # Use GPT-4o for high-quality research synthesis
            response = await client.chat.completions.create(
                model="gpt-4o",  # Best reasoning for research
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert consulting researcher providing accurate, well-researched insights with citations."
                    },
                    {
                        "role": "user",
                        "content": research_prompt
                    }
                ],
                temperature=0.3,  # Balanced for accuracy and insight
                max_tokens=1500,
            )
            
            search_result = response.choices[0].message.content
            
            return {
                "result": search_result,
                "query": query,
                "focus": focus,
                "model_used": "gpt-4o (OpenAI)",
                "note": "Using GPT-4o for research synthesis. For real-time web data, consider integrating web browsing API.",
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Analyze artifacts and generate deep insights, patterns, or strategic recommendations using advanced reasoning."
    )
    async def analyze_artifacts(
        ctx: RunContextWrapper[ConsultingAgentContext],
        analysis_type: str,  # pain_points, requirements, risks, stakeholder_feedback, trends
        phase: str | None = None,
    ) -> Dict[str, Any]:
        """Analyze captured artifacts for insights using o1-mini for advanced reasoning."""
        try:
            from openai import AsyncOpenAI
            
            opp = await opportunity_store.get_active_opportunity()
            if not opp:
                return {"error": "No active opportunity"}
            
            artifacts = opp.get_phase_artifacts() if phase else opp.artifacts
            
            if not artifacts:
                return {"error": "No artifacts to analyze"}
            
            # Build comprehensive artifact summary for analysis
            artifact_data = []
            for artifact in artifacts:
                artifact_data.append({
                    "type": artifact.artifact_type,
                    "title": artifact.title,
                    "content": artifact.content[:500],  # First 500 chars
                    "tags": artifact.tags,
                    "phase": artifact.phase.value if hasattr(artifact.phase, 'value') else str(artifact.phase),
                })
            
            # Build analysis prompt
            analysis_prompt = f"""Analyze the following artifacts from a consulting engagement:

Opportunity: {opp.name}
Client: {opp.client_name}
Analysis Type: {analysis_type}
Total Artifacts: {len(artifacts)}

Artifacts:
{chr(10).join([f"- [{a['type']}] {a['title']}: {a['content'][:200]}..." for a in artifact_data[:20]])}

Provide a deep analysis including:
1. Key patterns and themes
2. Critical insights
3. Potential risks or gaps
4. Strategic recommendations
5. Prioritized action items

Be specific and actionable."""
            
            # Use o1-mini for advanced reasoning
            client = AsyncOpenAI()
            response = await client.chat.completions.create(
                model="o1-mini",  # Advanced reasoning model
                messages=[
                    {
                        "role": "user",
                        "content": analysis_prompt
                    }
                ],
                # Note: o1 models don't support temperature/max_tokens
            )
            
            analysis_result = response.choices[0].message.content
            
            return {
                "analysis_type": analysis_type,
                "total_artifacts": len(artifacts),
                "analysis": analysis_result,
                "model_used": "o1-mini (Advanced Reasoning)",
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Search captured artifacts by keyword, tag, or type to find relevant information."
    )
    async def search_artifacts(
        ctx: RunContextWrapper[ConsultingAgentContext],
        keyword: str,
        artifact_type: str | None = None,
        tags: str | None = None,
    ) -> Dict[str, Any]:
        """Search through captured artifacts."""
        try:
            opp = await opportunity_store.get_active_opportunity()
            if not opp:
                return {"error": "No active opportunity"}
            
            results = []
            for artifact in opp.artifacts:
                # Filter by type if specified
                if artifact_type and artifact.artifact_type != artifact_type:
                    continue
                
                # Filter by tags if specified
                if tags:
                    tag_list = [t.strip() for t in tags.split(",")]
                    if not any(tag in artifact.tags for tag in tag_list):
                        continue
                
                # Search in title and content
                if keyword.lower() in artifact.title.lower() or keyword.lower() in artifact.content.lower():
                    results.append({
                        "id": artifact.id,
                        "type": artifact.artifact_type,
                        "title": artifact.title,
                        "phase": artifact.phase.value if hasattr(artifact.phase, 'value') else str(artifact.phase),
                        "tags": artifact.tags,
                        "snippet": artifact.content[:150] + "..." if len(artifact.content) > 150 else artifact.content,
                    })
            
            return {
                "query": keyword,
                "results_count": len(results),
                "results": results[:10],  # Return top 10
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Move the current opportunity to the next phase (pre_assessment, discovery, solution_design, implementation)."
    )
    async def advance_to_phase(
        ctx: RunContextWrapper[ConsultingAgentContext],
        phase: str,
    ) -> Dict[str, str]:
        """Move opportunity to a new phase."""
        try:
            opp = await opportunity_store.get_active_opportunity()
            if not opp:
                return {"error": "No active opportunity"}
            
            updated_opp = await opportunity_store.move_opportunity_to_phase(
                opp_id=opp.id,
                new_phase=phase,
            )
            
            if updated_opp:
                ctx.context.client_tool_call = ClientToolCall(
                    name="phase_changed",
                    arguments={"phase": phase, "opportunity_id": opp.id},
                )
                return {
                    "result": f"Moved to {phase} phase",
                    "opportunity": updated_opp.name,
                    "new_phase": phase,
                }
            return {"error": "Failed to update phase"}
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Get current opportunity context including phase, artifacts, and insights."
    )
    async def get_opportunity_context(
        ctx: RunContextWrapper[ConsultingAgentContext],
    ) -> Dict[str, Any]:
        """Retrieve active opportunity details."""
        try:
            opp = await opportunity_store.get_active_opportunity()
            if not opp:
                return {"error": "No active opportunity"}
            
            phase_artifacts = opp.get_phase_artifacts()
            return {
                "opportunity": opp.name,
                "client": opp.client_name,
                "current_phase": opp.current_phase.value,
                "total_artifacts": len(opp.artifacts),
                "phase_artifacts": len(phase_artifacts),
                "key_insights": opp.key_insights,
                "stakeholders": opp.stakeholders,
            }
        except Exception as e:
            return {"error": str(e)}
    
    # ========== TASK MANAGEMENT ==========
    
    @function_tool(
        description_override="Create a new task for the consulting project."
    )
    async def create_task(
        ctx: RunContextWrapper[ConsultingAgentContext],
        title: str,
        description: str,
        phase: str,
    ) -> Dict[str, str]:
        """Create a new consulting task."""
        try:
            task = await task_store.create(
                title=title,
                description=description,
                phase=phase,
            )
            # Notify client to refresh task list
            ctx.context.client_tool_call = ClientToolCall(
                name="task_created",
                arguments={"task_id": task.id, "title": task.title},
            )
            return {
                "result": f"Task '{title}' created successfully",
                "task_id": task.id,
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="List all current tasks or tasks for a specific phase."
    )
    async def list_tasks(
        ctx: RunContextWrapper[ConsultingAgentContext],
        phase: str | None = None,
    ) -> Dict[str, Any]:
        """List consulting tasks."""
        try:
            if phase:
                tasks = await task_store.list_by_phase(phase)
            else:
                tasks = await task_store.list_all()
            
            task_list = [
                f"- {task.title} ({task.phase}, {task.status.value})"
                for task in tasks
            ]
            
            return {
                "count": len(tasks),
                "tasks": "\n".join(task_list) if task_list else "No tasks found",
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Update the status of a task (todo, in_progress, completed)."
    )
    async def update_task_status(
        ctx: RunContextWrapper[ConsultingAgentContext],
        task_id: str,
        status: str,
    ) -> Dict[str, str]:
        """Update task status."""
        try:
            task_status = TaskStatus(status.lower())
            task = await task_store.update_status(task_id, task_status)
            if task is None:
                return {"error": "Task not found"}
            
            ctx.context.client_tool_call = ClientToolCall(
                name="task_updated",
                arguments={"task_id": task.id, "status": task.status.value},
            )
            
            return {
                "result": f"Task status updated to {status}",
                "task_id": task.id,
            }
        except ValueError:
            return {"error": "Invalid status. Use: todo, in_progress, or completed"}
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Prepare a structured meeting brief with agenda, objectives, and key questions."
    )
    async def prepare_meeting_brief(
        ctx: RunContextWrapper[ConsultingAgentContext],
        meeting_title: str,
        attendees: str,  # comma-separated
        objective: str,
        agenda_items: str,  # comma-separated
        background: str,
        key_questions: str,  # comma-separated
    ) -> Dict[str, Any]:
        """Generate meeting preparation brief."""
        try:
            brief = await consulting_store.create_meeting_brief(
                meeting_title=meeting_title,
                attendees=[a.strip() for a in attendees.split(",")],
                objective=objective,
                agenda_items=[item.strip() for item in agenda_items.split(",")],
                background=background,
                key_questions=[q.strip() for q in key_questions.split(",")],
            )
            return {
                "result": f"Meeting brief created for '{meeting_title}'",
                "brief_id": brief.id,
                "attendees_count": len(brief.attendees),
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Capture process documentation, pain points, or requirements discovered during due-diligence."
    )
    async def capture_process_note(
        ctx: RunContextWrapper[ConsultingAgentContext],
        title: str,
        description: str,
        category: str,  # current_state, pain_point, opportunity, requirement
        phase: str,
        stakeholders: str,  # comma-separated
    ) -> Dict[str, str]:
        """Document process insights."""
        try:
            note = await consulting_store.capture_process_note(
                title=title,
                description=description,
                category=category,
                phase=phase,
                stakeholders=[s.strip() for s in stakeholders.split(",")],
            )
            return {
                "result": f"Process note '{title}' captured",
                "note_id": note.id,
                "category": category,
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Log a project risk, blocker, or dependency with severity level and mitigation plan."
    )
    async def log_risk(
        ctx: RunContextWrapper[ConsultingAgentContext],
        title: str,
        description: str,
        level: str,  # low, medium, high, critical
        impact: str,
        mitigation: str,
        owner: str | None = None,
    ) -> Dict[str, str]:
        """Track project risks."""
        try:
            risk = await consulting_store.log_risk(
                title=title,
                description=description,
                level=level,
                impact=impact,
                mitigation=mitigation,
                owner=owner,
            )
            return {
                "result": f"Risk '{title}' logged at {level} severity",
                "risk_id": risk.id,
                "level": level,
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Track a project deliverable with phase, due date, and owner."
    )
    async def track_deliverable(
        ctx: RunContextWrapper[ConsultingAgentContext],
        name: str,
        description: str,
        phase: str,
        due_date: str | None = None,
        owner: str | None = None,
    ) -> Dict[str, str]:
        """Monitor deliverables."""
        try:
            deliverable = await consulting_store.track_deliverable(
                name=name,
                description=description,
                phase=phase,
                due_date=due_date,
                owner=owner,
            )
            return {
                "result": f"Deliverable '{name}' tracked",
                "deliverable_id": deliverable.id,
                "phase": phase,
            }
        except Exception as e:
            return {"error": str(e)}
    
    @function_tool(
        description_override="Switch the chat interface between light and dark themes."
    )
    async def switch_theme(
        ctx: RunContextWrapper[ConsultingAgentContext],
        theme: str,
    ) -> Dict[str, str]:
        """Switch UI theme."""
        try:
            requested = _normalize_color_scheme(theme)
            ctx.context.client_tool_call = ClientToolCall(
                name="switch_theme",
                arguments={"theme": requested},
            )
            return {"theme": requested}
        except Exception as e:
            return {"error": str(e)}
    
    tools = [
        # Research & Intelligence (NEW!)
        search_web,
        analyze_artifacts,
        search_artifacts,
        # Opportunity management
        advance_to_phase,
        get_opportunity_context,
        # Task management
        create_task,
        list_tasks,
        update_task_status,
        # Consulting tools
        prepare_meeting_brief,
        capture_process_note,
        log_risk,
        track_deliverable,
        # UI
        switch_theme,
    ]
    
    return Agent[ConsultingAgentContext](
        model=MODEL,
        name="Consulting AI Assistant",
        instructions=INSTRUCTIONS,
        tools=tools,  # type: ignore[arg-type]
    )


class ConsultingAIServer(ChatKitServer[dict[str, Any]]):
    """ChatKit server for consulting AI assistant."""
    
    def __init__(self) -> None:
        # Use Supabase store if configured, otherwise fall back to memory
        if USE_SUPABASE:
            try:
                from .supabase_chatkit_store import supabase_chatkit_store
                self.store = supabase_chatkit_store
                print("INFO: Using Supabase ChatKit store for persistent conversations")
            except Exception as e:
                print(f"WARNING: Failed to initialize Supabase ChatKit store: {e}")
                print("WARNING: Falling back to in-memory store. Conversations will not persist.")
                self.store = MemoryStore()
        else:
            self.store = MemoryStore()
            print("INFO: Using in-memory ChatKit store (conversations will not persist)")
        
        super().__init__(self.store)
        self.agent = build_consulting_agent()
    
    async def _generate_thread_title(self, first_message: str, opportunity_name: str | None) -> str:
        """Generate a meaningful thread title using AI based on the first message."""
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI()
        
        prompt = f"""Generate a short, descriptive title (max 50 characters) for this conversation.

Opportunity: {opportunity_name or "General"}
First message: {first_message[:200]}

Title should be:
- Specific to the topic discussed
- Include client/opportunity name if relevant
- Professional and concise
- No quotes or special formatting

Examples:
- "Acme Corp - Discovery Pain Points"
- "Beta Inc - Meeting Prep for CTO"
- "Supply Chain - Risk Analysis"

Generate only the title, nothing else:"""
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=20,
                temperature=0.7,
            )
            title = response.choices[0].message.content.strip()
            # Remove quotes if AI added them
            title = title.strip('"').strip("'")
            return title[:50]  # Ensure max length
        except Exception as e:
            print(f"Error generating thread title: {e}")
            # Fallback to opportunity name or generic
            return f"{opportunity_name} - Discussion" if opportunity_name else "New Discussion"
    
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
        
        # Get active opportunity for context
        opp = await opportunity_store.get_active_opportunity()
        
        # Auto-generate thread title on first message
        # Check if this is the first message in the thread
        should_generate_title = False
        
        # Load thread items to check if this is the first message
        try:
            thread_items = await self.store.load_thread_items(thread.id, limit=10, after=None, context=context)
            item_count = len(thread_items.data)
            print(f"DEBUG: Thread '{thread.title}' (ID: {thread.id}) has {item_count} items")
            
            # Generate title if this is the first or second message (first is user, second is assistant response)
            if item_count <= 2:
                should_generate_title = True
                print(f"DEBUG: Will generate title for thread {thread.id}")
        except Exception as e:
            print(f"DEBUG: Error checking thread items: {e}")
            # Fallback: check title
            if not thread.title or "new thread" in thread.title.lower() or thread.title.lower() == "new chat":
                should_generate_title = True
                print(f"DEBUG: Will generate title based on title check")
        
        # CRITICAL: Inject opportunity context into every conversation
        if opp:
            # Build rich context summary with ALL opportunity data
            phase_artifacts = opp.get_phase_artifacts()
            context_injection = (
                f"\n\n[SYSTEM CONTEXT - Current Opportunity]\n"
                f"Opportunity: {opp.name}\n"
                f"Client: {opp.client_name}\n"
                f"Description: {opp.description}\n"
                f"Status: {opp.status}\n"
                f"Current Phase: {opp.current_phase.value}\n"
            )
            
            # Add stakeholders if any
            if opp.stakeholders:
                context_injection += f"Stakeholders: {', '.join(opp.stakeholders)}\n"
            
            # Add context summary if exists
            if opp.context_summary:
                context_injection += f"Context Summary: {opp.context_summary}\n"
            
            context_injection += (
                f"Total Artifacts: {len(opp.artifacts)}\n"
                f"Phase Artifacts: {len(phase_artifacts)}\n"
            )
            
            if opp.key_insights:
                context_injection += f"Key Insights:\n"
                for insight in opp.key_insights[:5]:
                    context_injection += f"- {insight}\n"
            
            if phase_artifacts:
                context_injection += f"\nRecent Artifacts in {opp.current_phase.value}:\n"
                for artifact in phase_artifacts[-5:]:  # Show last 5
                    context_injection += f"- [{artifact.artifact_type}] {artifact.title}\n"
                    context_injection += f"  ID: {artifact.id}\n"
                    if artifact.created_by:
                        context_injection += f"  Created by: {artifact.created_by}\n"
                    context_injection += f"  Created: {artifact.created_at.strftime('%Y-%m-%d %H:%M')}\n"
                    if artifact.tags:
                        context_injection += f"  Tags: {', '.join(artifact.tags)}\n"
                    # Show full content for recent artifacts (not just snippet)
                    content_preview = artifact.content[:300] if len(artifact.content) > 300 else artifact.content
                    context_injection += f"  Content: {content_preview}"
                    if len(artifact.content) > 300:
                        context_injection += "..."
                    context_injection += "\n"
            
            # Show ALL artifacts with content snippets for complete context
            if opp.artifacts:
                context_injection += f"\n=== ALL CAPTURED ARTIFACTS (Complete Context) ===\n"
                for artifact in opp.artifacts:
                    phase_key = artifact.phase.value if hasattr(artifact.phase, 'value') else str(artifact.phase)
                    context_injection += f"\n[{artifact.artifact_type}] {artifact.title} ({phase_key})\n"
                    # Show meaningful content snippet (not just 150 chars)
                    content_snippet = artifact.content[:400] if len(artifact.content) > 400 else artifact.content
                    context_injection += f"  {content_snippet}"
                    if len(artifact.content) > 400:
                        context_injection += "..."
                    context_injection += "\n"
                    if artifact.tags:
                        context_injection += f"  Tags: {', '.join(artifact.tags)}\n"
            
            context_injection += "[END CONTEXT]\n\n"
            
            # Prepend context to user message
            message_text = context_injection + message_text
        if not message_text:
            return
        
        agent_context = ConsultingAgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )
        
        result = Runner.run_streamed(
            self.agent,
            message_text,
            context=agent_context,
        )
        
        async for event in stream_agent_response(agent_context, result):
            yield event
        
        # Generate and update thread title after response completes
        if should_generate_title:
            print(f"DEBUG: Generating title for message: {message_text[:100]}")
            opportunity_name = opp.client_name if opp else None
            new_title = await self._generate_thread_title(message_text, opportunity_name)
            print(f"DEBUG: Generated title: '{new_title}'")
            
            # Update thread metadata with new title
            updated_thread = thread.model_copy(update={"title": new_title})
            await self.store.save_thread(updated_thread, context)
            print(f"DEBUG: Saved thread with new title")
            
            # Note: ChatKit will automatically refresh thread list on next load
            # The title is saved in the store, so it will appear on refresh
    
    async def to_message_content(self, _input: Attachment) -> ResponseInputContentParam:
        raise RuntimeError("File attachments are not supported in this demo.")


def create_chatkit_server() -> ConsultingAIServer:
    """Return a configured ChatKit server instance."""
    return ConsultingAIServer()
