"""Opportunity-centric data model for consulting engagements."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Any
from uuid import uuid4


class OpportunityPhase(str, Enum):
    """Consulting engagement phases."""
    PRE_ASSESSMENT = "pre_assessment"
    DISCOVERY = "discovery"
    SOLUTION_DESIGN = "solution_design"
    IMPLEMENTATION = "implementation"


class OpportunityStatus(str, Enum):
    """Overall opportunity status."""
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


@dataclass(slots=True)
class PhaseArtifact:
    """Documents, notes, or deliverables created in a phase."""
    title: str
    content: str
    artifact_type: str  # meeting_note, process_map, pain_point, requirement, risk, deliverable
    phase: OpportunityPhase
    created_by: str | None = None
    id: str = field(default_factory=lambda: f"artifact_{uuid4().hex[:8]}")
    created_at: datetime = field(default_factory=datetime.utcnow)
    tags: List[str] = field(default_factory=list)
    
    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "artifactType": self.artifact_type,
            "phase": self.phase.value,
            "createdBy": self.created_by,
            "createdAt": self.created_at.isoformat(),
            "tags": self.tags,
        }


@dataclass(slots=True)
class PhaseProgress:
    """Track progress within a specific phase."""
    phase: OpportunityPhase
    status: str  # not_started, in_progress, completed
    start_date: datetime | None = None
    end_date: datetime | None = None
    key_activities: List[str] = field(default_factory=list)
    artifacts_count: int = 0
    completion_percentage: int = 0
    
    def as_dict(self) -> dict:
        return {
            "phase": self.phase.value,
            "status": self.status,
            "startDate": self.start_date.isoformat() if self.start_date else None,
            "endDate": self.end_date.isoformat() if self.end_date else None,
            "keyActivities": self.key_activities,
            "artifactsCount": self.artifacts_count,
            "completionPercentage": self.completion_percentage,
        }


@dataclass(slots=True)
class Opportunity:
    """A consulting engagement/opportunity."""
    name: str
    client_name: str
    description: str
    current_phase: OpportunityPhase = OpportunityPhase.PRE_ASSESSMENT
    status: OpportunityStatus = OpportunityStatus.ACTIVE
    id: str = field(default_factory=lambda: f"opp_{uuid4().hex[:8]}")
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    # Phase tracking
    phase_progress: Dict[str, PhaseProgress] = field(default_factory=dict)
    
    # Artifacts organized by phase
    artifacts: List[PhaseArtifact] = field(default_factory=list)
    
    # Key stakeholders
    stakeholders: List[str] = field(default_factory=list)
    
    # Conversation context (accumulated knowledge)
    context_summary: str = ""
    key_insights: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        """Initialize phase progress for all phases."""
        if not self.phase_progress:
            for phase in OpportunityPhase:
                self.phase_progress[phase.value] = PhaseProgress(
                    phase=phase,
                    status="not_started" if phase != self.current_phase else "in_progress"
                )
    
    def add_artifact(
        self,
        title: str,
        content: str,
        artifact_type: str,
        phase: OpportunityPhase | None = None,
        created_by: str | None = None,
        tags: List[str] | None = None,
    ) -> PhaseArtifact:
        """Add an artifact to the opportunity."""
        artifact = PhaseArtifact(
            title=title,
            content=content,
            artifact_type=artifact_type,
            phase=phase or self.current_phase,
            created_by=created_by,
            tags=tags or [],
        )
        self.artifacts.append(artifact)
        
        # Update phase artifact count
        phase_key = (phase or self.current_phase).value
        if phase_key in self.phase_progress:
            self.phase_progress[phase_key].artifacts_count += 1
        
        return artifact
    
    def move_to_phase(self, new_phase: OpportunityPhase) -> None:
        """Transition to a new phase."""
        # Mark old phase as completed
        old_phase_key = self.current_phase.value
        if old_phase_key in self.phase_progress:
            self.phase_progress[old_phase_key].status = "completed"
            self.phase_progress[old_phase_key].end_date = datetime.utcnow()
            self.phase_progress[old_phase_key].completion_percentage = 100
        
        # Start new phase
        self.current_phase = new_phase
        new_phase_key = new_phase.value
        if new_phase_key in self.phase_progress:
            self.phase_progress[new_phase_key].status = "in_progress"
            self.phase_progress[new_phase_key].start_date = datetime.utcnow()
    
    def get_phase_artifacts(self, phase: OpportunityPhase | None = None) -> List[PhaseArtifact]:
        """Get artifacts for a specific phase or current phase."""
        target_phase = phase or self.current_phase
        return [a for a in self.artifacts if a.phase == target_phase]
    
    def add_insight(self, insight: str) -> None:
        """Add a key insight to the opportunity."""
        if insight not in self.key_insights:
            self.key_insights.append(insight)
    
    def as_dict(self) -> dict:
        """Serialize for API responses."""
        return {
            "id": self.id,
            "name": self.name,
            "clientName": self.client_name,
            "description": self.description,
            "currentPhase": self.current_phase.value,
            "status": self.status.value,
            "createdAt": self.created_at.isoformat(),
            "phaseProgress": {
                phase: progress.as_dict()
                for phase, progress in self.phase_progress.items()
            },
            "artifactsCount": len(self.artifacts),
            "stakeholders": self.stakeholders,
            "contextSummary": self.context_summary,
            "keyInsights": self.key_insights,
        }


class OpportunityStore:
    """Manage consulting opportunities with persistent context."""
    
    def __init__(self) -> None:
        self._opportunities: Dict[str, Opportunity] = {}
        self._lock = asyncio.Lock()
        self._active_opportunity_id: str | None = None
    
    async def create_opportunity(
        self,
        name: str,
        client_name: str,
        description: str,
        stakeholders: List[str] | None = None,
    ) -> Opportunity:
        """Create a new consulting opportunity."""
        async with self._lock:
            opp = Opportunity(
                name=name,
                client_name=client_name,
                description=description,
                stakeholders=stakeholders or [],
            )
            self._opportunities[opp.id] = opp
            # Auto-set as active if it's the first one
            if self._active_opportunity_id is None:
                self._active_opportunity_id = opp.id
            return opp
    
    async def get_opportunity(self, opp_id: str) -> Opportunity | None:
        """Get a specific opportunity."""
        async with self._lock:
            return self._opportunities.get(opp_id)
    
    async def get_active_opportunity(self) -> Opportunity | None:
        """Get the currently active opportunity."""
        async with self._lock:
            if self._active_opportunity_id:
                return self._opportunities.get(self._active_opportunity_id)
            return None
    
    async def set_active_opportunity(self, opp_id: str) -> bool:
        """Set which opportunity is currently active."""
        async with self._lock:
            if opp_id in self._opportunities:
                self._active_opportunity_id = opp_id
                return True
            return False
    
    async def list_opportunities(self) -> List[Opportunity]:
        """List all opportunities."""
        async with self._lock:
            return list(self._opportunities.values())
    
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
        async with self._lock:
            opp = self._opportunities.get(opp_id)
            if not opp:
                return None
            
            phase_enum = OpportunityPhase(phase) if phase else None
            return opp.add_artifact(
                title=title,
                content=content,
                artifact_type=artifact_type,
                phase=phase_enum,
                created_by=created_by,
                tags=tags,
            )
    
    async def move_opportunity_to_phase(
        self,
        opp_id: str,
        new_phase: str,
    ) -> Opportunity | None:
        """Move opportunity to a new phase."""
        async with self._lock:
            opp = self._opportunities.get(opp_id)
            if not opp:
                return None
            
            phase_enum = OpportunityPhase(new_phase)
            opp.move_to_phase(phase_enum)
            return opp
    
    async def update_opportunity_context(
        self,
        opp_id: str,
        context_summary: str | None = None,
        new_insight: str | None = None,
    ) -> Opportunity | None:
        """Update the accumulated context for an opportunity."""
        async with self._lock:
            opp = self._opportunities.get(opp_id)
            if not opp:
                return None
            
            if context_summary:
                opp.context_summary = context_summary
            if new_insight:
                opp.add_insight(new_insight)
            
            return opp


opportunity_store = OpportunityStore()
"""Global opportunity store instance."""
