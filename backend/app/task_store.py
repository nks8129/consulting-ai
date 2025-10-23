"""In-memory store for consulting tasks."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List
from uuid import uuid4


class TaskStatus(str, Enum):
    """Task lifecycle states."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskPhase(str, Enum):
    """Due-diligence phases."""
    PRE_ASSESSMENT = "pre_assessment"
    DUE_DILIGENCE = "due_diligence"
    IMPLEMENTATION = "implementation"


@dataclass(slots=True)
class Task:
    """Represents a single consulting task."""
    
    title: str
    description: str
    phase: str
    status: TaskStatus = TaskStatus.TODO
    id: str = field(default_factory=lambda: f"task_{uuid4().hex[:8]}")
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def as_dict(self) -> dict[str, str]:
        """Serialize the task for JSON responses."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "phase": self.phase,
            "status": self.status.value,
            "createdAt": self.created_at.isoformat(),
        }


class TaskStore:
    """Thread-safe helper that stores tasks in memory."""
    
    def __init__(self) -> None:
        self._tasks: Dict[str, Task] = {}
        self._order: List[str] = []
        self._lock = asyncio.Lock()
    
    async def create(
        self,
        *,
        title: str,
        description: str,
        phase: str,
    ) -> Task:
        """Create a new task and return it."""
        async with self._lock:
            task = Task(title=title, description=description, phase=phase)
            self._tasks[task.id] = task
            self._order.append(task.id)
            return task
    
    async def update_status(self, task_id: str, status: TaskStatus) -> Task | None:
        """Update task status."""
        async with self._lock:
            task = self._tasks.get(task_id)
            if task is None:
                return None
            task.status = status
            return task
    
    async def list_all(self) -> List[Task]:
        """Return all tasks in insertion order."""
        async with self._lock:
            return [self._tasks[task_id] for task_id in self._order]
    
    async def list_by_phase(self, phase: str) -> List[Task]:
        """Return tasks for a specific phase."""
        async with self._lock:
            return [
                self._tasks[task_id]
                for task_id in self._order
                if self._tasks[task_id].phase == phase
            ]


task_store = TaskStore()
"""Global instance used by the API and ChatKit workflow."""
