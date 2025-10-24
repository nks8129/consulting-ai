"""Supabase-backed ChatKit store for persistent conversation history."""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List

from chatkit.store import NotFoundError, Store
from chatkit.types import Attachment, Page, Thread, ThreadItem, ThreadMetadata
from pydantic import TypeAdapter

from .supabase_store import SupabaseClient

# Type adapter for deserializing ThreadItem union
thread_item_adapter = TypeAdapter(ThreadItem)


class SupabaseChatKitStore(Store[dict[str, Any]]):
    """Supabase-backed store for ChatKit conversations."""

    def __init__(self) -> None:
        self.client = SupabaseClient.get_client()

    @staticmethod
    def _coerce_thread_metadata(thread: ThreadMetadata | Thread) -> ThreadMetadata:
        """Return thread metadata without any embedded items."""
        has_items = isinstance(thread, Thread) or "items" in getattr(
            thread, "model_fields_set", set()
        )
        if not has_items:
            return thread.model_copy(deep=True)

        data = thread.model_dump()
        data.pop("items", None)
        return ThreadMetadata(**data).model_copy(deep=True)

    # -- Thread metadata -------------------------------------------------
    async def load_thread(self, thread_id: str, context: dict[str, Any]) -> ThreadMetadata:
        try:
            result = self.client.table("chatkit_threads").select("*").eq("id", thread_id).execute()
            
            if not result.data:
                raise NotFoundError(f"Thread {thread_id} not found")
            
            data = result.data[0]
            return ThreadMetadata(
                id=data["id"],
                title=data.get("title"),
                created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
                **(data.get("metadata", {}) or {})
            )
        except NotFoundError:
            raise
        except Exception as e:
            print(f"ERROR loading thread {thread_id}: {e}")
            raise NotFoundError(f"Thread {thread_id} not found")

    async def save_thread(self, thread: ThreadMetadata, context: dict[str, Any]) -> None:
        metadata = self._coerce_thread_metadata(thread)
        
        # Get active opportunity to link thread
        active_result = self.client.table("active_opportunity").select("*").execute()
        opportunity_id = None
        if active_result.data and active_result.data[0].get("opportunity_id"):
            opportunity_id = active_result.data[0]["opportunity_id"]
        
        thread_data = {
            "id": metadata.id,
            "opportunity_id": opportunity_id,
            "title": metadata.title,
            "created_at": metadata.created_at.isoformat() if metadata.created_at else datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": {}
        }
        
        # Check if thread exists
        existing = self.client.table("chatkit_threads").select("id").eq("id", metadata.id).execute()
        
        if existing.data:
            # Update
            self.client.table("chatkit_threads").update(thread_data).eq("id", metadata.id).execute()
        else:
            # Insert
            self.client.table("chatkit_threads").insert(thread_data).execute()

    async def load_threads(
        self,
        limit: int,
        after: str | None,
        order: str,
        context: dict[str, Any],
    ) -> Page[ThreadMetadata]:
        query = self.client.table("chatkit_threads").select("*")
        
        # Order by created_at
        if order == "desc":
            query = query.order("created_at", desc=True)
        else:
            query = query.order("created_at", desc=False)
        
        # Pagination
        if after:
            # Find the timestamp of the 'after' thread
            after_result = self.client.table("chatkit_threads").select("created_at").eq("id", after).execute()
            if after_result.data:
                after_time = after_result.data[0]["created_at"]
                if order == "desc":
                    query = query.lt("created_at", after_time)
                else:
                    query = query.gt("created_at", after_time)
        
        # Fetch limit + 1 to check if there are more
        query = query.limit(limit + 1)
        result = query.execute()
        
        threads = []
        for data in result.data[:limit]:
            threads.append(ThreadMetadata(
                id=data["id"],
                title=data.get("title"),
                created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
                **(data.get("metadata", {}) or {})
            ))
        
        has_more = len(result.data) > limit
        next_after = threads[-1].id if has_more and threads else None
        
        return Page(
            data=threads,
            has_more=has_more,
            after=next_after,
        )

    async def delete_thread(self, thread_id: str, context: dict[str, Any]) -> None:
        # Items will be deleted automatically due to CASCADE
        self.client.table("chatkit_threads").delete().eq("id", thread_id).execute()

    # -- Thread items ----------------------------------------------------
    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: dict[str, Any],
    ) -> Page[ThreadItem]:
        query = self.client.table("chatkit_thread_items").select("*").eq("thread_id", thread_id)
        
        # Order by created_at
        if order == "desc":
            query = query.order("created_at", desc=True)
        else:
            query = query.order("created_at", desc=False)
        
        # Pagination
        if after:
            after_result = self.client.table("chatkit_thread_items").select("created_at").eq("id", after).execute()
            if after_result.data:
                after_time = after_result.data[0]["created_at"]
                if order == "desc":
                    query = query.lt("created_at", after_time)
                else:
                    query = query.gt("created_at", after_time)
        
        query = query.limit(limit + 1)
        result = query.execute()
        
        items = []
        for data in result.data[:limit]:
            # Deserialize ThreadItem from JSONB using TypeAdapter
            content = data["content"]
            item = thread_item_adapter.validate_python(content)
            items.append(item)
        
        has_more = len(result.data) > limit
        next_after = items[-1].id if has_more and items else None
        
        return Page(data=items, has_more=has_more, after=next_after)

    async def add_thread_item(
        self, thread_id: str, item: ThreadItem, context: dict[str, Any]
    ) -> None:
        item_data = {
            "id": item.id,
            "thread_id": thread_id,
            "item_type": item.__class__.__name__,
            "content": json.loads(item.model_dump_json()),
            "created_at": getattr(item, "created_at", datetime.utcnow()).isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        self.client.table("chatkit_thread_items").insert(item_data).execute()
        
        # Update thread's updated_at
        self.client.table("chatkit_threads").update({
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", thread_id).execute()

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict[str, Any]) -> None:
        item_data = {
            "id": item.id,
            "thread_id": thread_id,
            "item_type": item.__class__.__name__,
            "content": json.loads(item.model_dump_json()),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        # Check if exists
        existing = self.client.table("chatkit_thread_items").select("id").eq("id", item.id).execute()
        
        if existing.data:
            # Update
            self.client.table("chatkit_thread_items").update(item_data).eq("id", item.id).execute()
        else:
            # Insert
            item_data["created_at"] = getattr(item, "created_at", datetime.utcnow()).isoformat()
            self.client.table("chatkit_thread_items").insert(item_data).execute()

    async def load_item(self, thread_id: str, item_id: str, context: dict[str, Any]) -> ThreadItem:
        result = self.client.table("chatkit_thread_items").select("*").eq("id", item_id).eq("thread_id", thread_id).execute()
        
        if not result.data:
            raise NotFoundError(f"Item {item_id} not found")
        
        content = result.data[0]["content"]
        return thread_item_adapter.validate_python(content)

    async def delete_thread_item(
        self, thread_id: str, item_id: str, context: dict[str, Any]
    ) -> None:
        self.client.table("chatkit_thread_items").delete().eq("id", item_id).eq("thread_id", thread_id).execute()

    # -- Files -----------------------------------------------------------
    async def save_attachment(
        self,
        attachment: Attachment,
        context: dict[str, Any],
    ) -> None:
        raise NotImplementedError(
            "SupabaseChatKitStore does not yet support attachments. "
            "Implement file storage with proper auth when needed."
        )

    async def load_attachment(
        self,
        attachment_id: str,
        context: dict[str, Any],
    ) -> Attachment:
        raise NotImplementedError(
            "SupabaseChatKitStore does not yet support attachments."
        )

    async def delete_attachment(self, attachment_id: str, context: dict[str, Any]) -> None:
        raise NotImplementedError(
            "SupabaseChatKitStore does not yet support attachments."
        )


# Global instance
supabase_chatkit_store = SupabaseChatKitStore()
