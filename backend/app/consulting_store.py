"""Extended data stores for consulting activities."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List
from uuid import uuid4


class RiskLevel(str, Enum):
    """Risk severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DeliverableStatus(str, Enum):
    """Deliverable completion status."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"


@dataclass(slots=True)
class MeetingBrief:
    """Meeting preparation brief."""
    meeting_title: str
    attendees: List[str]
    objective: str
    agenda_items: List[str]
    background: str
    key_questions: List[str]
    id: str = field(default_factory=lambda: f"brief_{uuid4().hex[:8]}")
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "meetingTitle": self.meeting_title,
            "attendees": self.attendees,
            "objective": self.objective,
            "agendaItems": self.agenda_items,
            "background": self.background,
            "keyQuestions": self.key_questions,
            "createdAt": self.created_at.isoformat(),
        }


@dataclass(slots=True)
class ProcessNote:
    """Captured process or pain point documentation."""
    title: str
    description: str
    category: str  # current_state, pain_point, opportunity, requirement
    phase: str
    stakeholders: List[str]
    id: str = field(default_factory=lambda: f"note_{uuid4().hex[:8]}")
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "phase": self.phase,
            "stakeholders": self.stakeholders,
            "createdAt": self.created_at.isoformat(),
        }


@dataclass(slots=True)
class Risk:
    """Project risk or blocker."""
    title: str
    description: str
    level: RiskLevel
    impact: str
    mitigation: str
    owner: str | None = None
    id: str = field(default_factory=lambda: f"risk_{uuid4().hex[:8]}")
    created_at: datetime = field(default_factory=datetime.utcnow)
    resolved: bool = False
    
    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "level": self.level.value,
            "impact": self.impact,
            "mitigation": self.mitigation,
            "owner": self.owner,
            "resolved": self.resolved,
            "createdAt": self.created_at.isoformat(),
        }


@dataclass(slots=True)
class Deliverable:
    """Project deliverable tracking."""
    name: str
    description: str
    phase: str
    due_date: str | None
    status: DeliverableStatus = DeliverableStatus.NOT_STARTED
    owner: str | None = None
    id: str = field(default_factory=lambda: f"deliv_{uuid4().hex[:8]}")
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "phase": self.phase,
            "dueDate": self.due_date,
            "status": self.status.value,
            "owner": self.owner,
            "createdAt": self.created_at.isoformat(),
        }


class ConsultingStore:
    """Unified store for all consulting data."""
    
    def __init__(self) -> None:
        self._meeting_briefs: Dict[str, MeetingBrief] = {}
        self._process_notes: Dict[str, ProcessNote] = {}
        self._risks: Dict[str, Risk] = {}
        self._deliverables: Dict[str, Deliverable] = {}
        self._lock = asyncio.Lock()
    
    # Meeting Briefs
    async def create_meeting_brief(
        self,
        meeting_title: str,
        attendees: List[str],
        objective: str,
        agenda_items: List[str],
        background: str,
        key_questions: List[str],
    ) -> MeetingBrief:
        async with self._lock:
            brief = MeetingBrief(
                meeting_title=meeting_title,
                attendees=attendees,
                objective=objective,
                agenda_items=agenda_items,
                background=background,
                key_questions=key_questions,
            )
            self._meeting_briefs[brief.id] = brief
            return brief
    
    async def list_meeting_briefs(self) -> List[MeetingBrief]:
        async with self._lock:
            return list(self._meeting_briefs.values())
    
    # Process Notes
    async def capture_process_note(
        self,
        title: str,
        description: str,
        category: str,
        phase: str,
        stakeholders: List[str],
    ) -> ProcessNote:
        async with self._lock:
            note = ProcessNote(
                title=title,
                description=description,
                category=category,
                phase=phase,
                stakeholders=stakeholders,
            )
            self._process_notes[note.id] = note
            return note
    
    async def list_process_notes(self, category: str | None = None) -> List[ProcessNote]:
        async with self._lock:
            if category:
                return [n for n in self._process_notes.values() if n.category == category]
            return list(self._process_notes.values())
    
    # Risks
    async def log_risk(
        self,
        title: str,
        description: str,
        level: str,
        impact: str,
        mitigation: str,
        owner: str | None = None,
    ) -> Risk:
        async with self._lock:
            risk = Risk(
                title=title,
                description=description,
                level=RiskLevel(level.lower()),
                impact=impact,
                mitigation=mitigation,
                owner=owner,
            )
            self._risks[risk.id] = risk
            return risk
    
    async def list_risks(self, include_resolved: bool = False) -> List[Risk]:
        async with self._lock:
            if include_resolved:
                return list(self._risks.values())
            return [r for r in self._risks.values() if not r.resolved]
    
    async def resolve_risk(self, risk_id: str) -> Risk | None:
        async with self._lock:
            risk = self._risks.get(risk_id)
            if risk:
                risk.resolved = True
            return risk
    
    # Deliverables
    async def track_deliverable(
        self,
        name: str,
        description: str,
        phase: str,
        due_date: str | None = None,
        owner: str | None = None,
    ) -> Deliverable:
        async with self._lock:
            deliverable = Deliverable(
                name=name,
                description=description,
                phase=phase,
                due_date=due_date,
                owner=owner,
            )
            self._deliverables[deliverable.id] = deliverable
            return deliverable
    
    async def update_deliverable_status(
        self,
        deliverable_id: str,
        status: str,
    ) -> Deliverable | None:
        async with self._lock:
            deliverable = self._deliverables.get(deliverable_id)
            if deliverable:
                deliverable.status = DeliverableStatus(status.lower().replace(" ", "_"))
            return deliverable
    
    async def list_deliverables(self, phase: str | None = None) -> List[Deliverable]:
        async with self._lock:
            if phase:
                return [d for d in self._deliverables.values() if d.phase == phase]
            return list(self._deliverables.values())


consulting_store = ConsultingStore()
"""Global instance for consulting data."""
