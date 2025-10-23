"""Supabase-backed storage for opportunities and tasks."""

from __future__ import annotations

import os
from typing import List, Dict, Any
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

from .opportunity_store import (
    Opportunity,
    OpportunityPhase,
    OpportunityStatus,
    PhaseArtifact,
    PhaseProgress,
)
from .task_store import Task, TaskStatus

# Load environment variables
load_dotenv()


class SupabaseClient:
    """Singleton Supabase client."""
    
    _instance: Client | None = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client."""
        if cls._instance is None:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_KEY must be set in environment variables"
                )
            
            cls._instance = create_client(supabase_url, supabase_key)
        
        return cls._instance


class SupabaseOpportunityStore:
    """Supabase-backed opportunity store."""
    
    def __init__(self) -> None:
        self.client = SupabaseClient.get_client()
    
    async def create_opportunity(
        self,
        name: str,
        client_name: str,
        description: str,
        stakeholders: List[str] | None = None,
    ) -> Opportunity:
        """Create a new consulting opportunity."""
        from uuid import uuid4
        
        opp_id = f"opp_{uuid4().hex[:8]}"
        
        # Create opportunity in database
        opp_data = {
            "id": opp_id,
            "name": name,
            "client_name": client_name,
            "description": description,
            "current_phase": OpportunityPhase.PRE_ASSESSMENT.value,
            "status": OpportunityStatus.ACTIVE.value,
            "stakeholders": stakeholders or [],
            "key_insights": [],
            "context_summary": "",
        }
        
        result = self.client.table("opportunities").insert(opp_data).execute()
        
        # Initialize phase progress for all phases
        phase_progress_data = []
        for phase in OpportunityPhase:
            phase_progress_data.append({
                "opportunity_id": opp_id,
                "phase": phase.value,
                "status": "in_progress" if phase == OpportunityPhase.PRE_ASSESSMENT else "not_started",
                "key_activities": [],
                "artifacts_count": 0,
                "completion_percentage": 0,
            })
        
        self.client.table("phase_progress").insert(phase_progress_data).execute()
        
        # Set as active if no active opportunity exists
        active_result = self.client.table("active_opportunity").select("*").execute()
        if active_result.data and (not active_result.data[0].get("opportunity_id")):
            self.client.table("active_opportunity").update(
                {"opportunity_id": opp_id}
            ).eq("id", active_result.data[0]["id"]).execute()
        
        # Convert to Opportunity object
        return self._dict_to_opportunity(result.data[0])
    
    async def get_opportunity(self, opp_id: str) -> Opportunity | None:
        """Get a specific opportunity."""
        result = self.client.table("opportunities").select("*").eq("id", opp_id).execute()
        
        if not result.data:
            return None
        
        return self._dict_to_opportunity(result.data[0])
    
    async def get_active_opportunity(self) -> Opportunity | None:
        """Get the currently active opportunity."""
        active_result = self.client.table("active_opportunity").select("*").execute()
        
        if not active_result.data or not active_result.data[0].get("opportunity_id"):
            return None
        
        opp_id = active_result.data[0]["opportunity_id"]
        return await self.get_opportunity(opp_id)
    
    async def set_active_opportunity(self, opp_id: str) -> bool:
        """Set which opportunity is currently active."""
        # Check if opportunity exists
        opp = await self.get_opportunity(opp_id)
        if not opp:
            return False
        
        # Update active opportunity
        active_result = self.client.table("active_opportunity").select("*").execute()
        if active_result.data:
            self.client.table("active_opportunity").update(
                {"opportunity_id": opp_id, "updated_at": datetime.utcnow().isoformat()}
            ).eq("id", active_result.data[0]["id"]).execute()
            return True
        
        return False
    
    async def list_opportunities(self) -> List[Opportunity]:
        """List all opportunities."""
        result = self.client.table("opportunities").select("*").order("created_at", desc=True).execute()
        
        return [self._dict_to_opportunity(opp_data) for opp_data in result.data]
    
    async def add_artifact_to_opportunity(
        self,
        opp_id: str,
        title: str,
        content: str,
        artifact_type: str,
        phase: str | None = None,
        created_by: str | None = None,
        tags: List[str] | None = None,
    ) -> PhaseArtifact | None:
        """Add an artifact to an opportunity."""
        from uuid import uuid4
        
        # Get opportunity to determine phase
        opp = await self.get_opportunity(opp_id)
        if not opp:
            return None
        
        artifact_id = f"artifact_{uuid4().hex[:8]}"
        artifact_phase = phase or opp.current_phase.value
        
        artifact_data = {
            "id": artifact_id,
            "opportunity_id": opp_id,
            "title": title,
            "content": content,
            "artifact_type": artifact_type,
            "phase": artifact_phase,
            "created_by": created_by,
            "tags": tags or [],
        }
        
        result = self.client.table("artifacts").insert(artifact_data).execute()
        
        # Update phase progress artifact count
        self.client.rpc(
            "increment_artifacts_count",
            {"opp_id": opp_id, "phase_name": artifact_phase}
        ).execute()
        
        # Convert to PhaseArtifact
        data = result.data[0]
        return PhaseArtifact(
            id=data["id"],
            title=data["title"],
            content=data["content"],
            artifact_type=data["artifact_type"],
            phase=OpportunityPhase(data["phase"]),
            created_by=data.get("created_by"),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
            tags=data.get("tags", []),
        )
    
    async def move_opportunity_to_phase(
        self,
        opp_id: str,
        new_phase: str,
    ) -> Opportunity | None:
        """Move opportunity to a new phase."""
        opp = await self.get_opportunity(opp_id)
        if not opp:
            return None
        
        old_phase = opp.current_phase.value
        
        # Update opportunity phase
        self.client.table("opportunities").update(
            {"current_phase": new_phase}
        ).eq("id", opp_id).execute()
        
        # Mark old phase as completed
        self.client.table("phase_progress").update({
            "status": "completed",
            "end_date": datetime.utcnow().isoformat(),
            "completion_percentage": 100,
        }).eq("opportunity_id", opp_id).eq("phase", old_phase).execute()
        
        # Start new phase
        self.client.table("phase_progress").update({
            "status": "in_progress",
            "start_date": datetime.utcnow().isoformat(),
        }).eq("opportunity_id", opp_id).eq("phase", new_phase).execute()
        
        return await self.get_opportunity(opp_id)
    
    async def update_opportunity_context(
        self,
        opp_id: str,
        context_summary: str | None = None,
        new_insight: str | None = None,
    ) -> Opportunity | None:
        """Update the accumulated context for an opportunity."""
        opp = await self.get_opportunity(opp_id)
        if not opp:
            return None
        
        update_data: Dict[str, Any] = {}
        
        if context_summary is not None:
            update_data["context_summary"] = context_summary
        
        if new_insight is not None:
            # Append to key_insights array
            current_insights = opp.key_insights or []
            if new_insight not in current_insights:
                current_insights.append(new_insight)
                update_data["key_insights"] = current_insights
        
        if update_data:
            self.client.table("opportunities").update(update_data).eq("id", opp_id).execute()
        
        return await self.get_opportunity(opp_id)
    
    async def delete_opportunity(self, opp_id: str) -> bool:
        """Delete an opportunity and all related data."""
        # Check if opportunity exists
        opp = await self.get_opportunity(opp_id)
        if not opp:
            return False
        
        # Delete related data (cascading delete)
        # 1. Delete artifacts
        self.client.table("artifacts").delete().eq("opportunity_id", opp_id).execute()
        
        # 2. Delete phase progress
        self.client.table("phase_progress").delete().eq("opportunity_id", opp_id).execute()
        
        # 3. Clear active opportunity if this was active
        active_result = self.client.table("active_opportunity").select("*").execute()
        if active_result.data and active_result.data[0].get("opportunity_id") == opp_id:
            self.client.table("active_opportunity").update(
                {"opportunity_id": None}
            ).eq("id", active_result.data[0]["id"]).execute()
        
        # 4. Delete the opportunity itself
        self.client.table("opportunities").delete().eq("id", opp_id).execute()
        
        return True
    
    def _dict_to_opportunity(self, data: Dict[str, Any]) -> Opportunity:
        """Convert database dict to Opportunity object."""
        # Get phase progress
        phase_progress_result = self.client.table("phase_progress").select("*").eq(
            "opportunity_id", data["id"]
        ).execute()
        
        phase_progress = {}
        for pp_data in phase_progress_result.data:
            phase_progress[pp_data["phase"]] = PhaseProgress(
                phase=OpportunityPhase(pp_data["phase"]),
                status=pp_data["status"],
                start_date=datetime.fromisoformat(pp_data["start_date"].replace("Z", "+00:00")) if pp_data.get("start_date") else None,
                end_date=datetime.fromisoformat(pp_data["end_date"].replace("Z", "+00:00")) if pp_data.get("end_date") else None,
                key_activities=pp_data.get("key_activities", []),
                artifacts_count=pp_data.get("artifacts_count", 0),
                completion_percentage=pp_data.get("completion_percentage", 0),
            )
        
        # Get artifacts
        artifacts_result = self.client.table("artifacts").select("*").eq(
            "opportunity_id", data["id"]
        ).order("created_at", desc=False).execute()
        
        artifacts = []
        for art_data in artifacts_result.data:
            artifacts.append(PhaseArtifact(
                id=art_data["id"],
                title=art_data["title"],
                content=art_data["content"],
                artifact_type=art_data["artifact_type"],
                phase=OpportunityPhase(art_data["phase"]),
                created_by=art_data.get("created_by"),
                created_at=datetime.fromisoformat(art_data["created_at"].replace("Z", "+00:00")),
                tags=art_data.get("tags", []),
            ))
        
        return Opportunity(
            id=data["id"],
            name=data["name"],
            client_name=data["client_name"],
            description=data["description"],
            current_phase=OpportunityPhase(data["current_phase"]),
            status=OpportunityStatus(data["status"]),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
            phase_progress=phase_progress,
            artifacts=artifacts,
            stakeholders=data.get("stakeholders", []),
            context_summary=data.get("context_summary", ""),
            key_insights=data.get("key_insights", []),
        )


class SupabaseTaskStore:
    """Supabase-backed task store."""
    
    def __init__(self) -> None:
        self.client = SupabaseClient.get_client()
    
    async def create(
        self,
        *,
        title: str,
        description: str,
        phase: str,
    ) -> Task:
        """Create a new task and return it."""
        from uuid import uuid4
        
        task_id = f"task_{uuid4().hex[:8]}"
        
        task_data = {
            "id": task_id,
            "title": title,
            "description": description,
            "phase": phase,
            "status": TaskStatus.TODO.value,
        }
        
        result = self.client.table("tasks").insert(task_data).execute()
        
        data = result.data[0]
        return Task(
            id=data["id"],
            title=data["title"],
            description=data["description"],
            phase=data["phase"],
            status=TaskStatus(data["status"]),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
        )
    
    async def update_status(self, task_id: str, status: TaskStatus) -> Task | None:
        """Update task status."""
        result = self.client.table("tasks").update(
            {"status": status.value}
        ).eq("id", task_id).execute()
        
        if not result.data:
            return None
        
        data = result.data[0]
        return Task(
            id=data["id"],
            title=data["title"],
            description=data["description"],
            phase=data["phase"],
            status=TaskStatus(data["status"]),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
        )
    
    async def list_all(self) -> List[Task]:
        """Return all tasks in insertion order."""
        result = self.client.table("tasks").select("*").order("created_at", desc=False).execute()
        
        return [
            Task(
                id=data["id"],
                title=data["title"],
                description=data["description"],
                phase=data["phase"],
                status=TaskStatus(data["status"]),
                created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
            )
            for data in result.data
        ]
    
    async def list_by_phase(self, phase: str) -> List[Task]:
        """Return tasks for a specific phase."""
        result = self.client.table("tasks").select("*").eq("phase", phase).order("created_at", desc=False).execute()
        
        return [
            Task(
                id=data["id"],
                title=data["title"],
                description=data["description"],
                phase=data["phase"],
                status=TaskStatus(data["status"]),
                created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
            )
            for data in result.data
        ]


# Global instances
supabase_opportunity_store = SupabaseOpportunityStore()
supabase_task_store = SupabaseTaskStore()
