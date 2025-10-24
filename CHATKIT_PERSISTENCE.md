# ChatKit Conversation Persistence

## Overview
ChatKit conversations are now persisted in Supabase, allowing conversations to survive server restarts and be linked to specific opportunities.

## Setup Instructions

### 1. Run the Updated Schema
Go to your Supabase project's SQL Editor and run the updated `supabase_schema.sql` file. The new tables added are:

- **`chatkit_threads`** - Stores conversation threads
  - `id` - Thread ID
  - `opportunity_id` - Links thread to an opportunity
  - `title` - Thread title
  - `created_at`, `updated_at` - Timestamps
  - `metadata` - Additional thread metadata (JSONB)

- **`chatkit_thread_items`** - Stores messages within threads
  - `id` - Item ID
  - `thread_id` - References the thread
  - `item_type` - Type of item (user_message, assistant_message, etc.)
  - `content` - Full item content (JSONB)
  - `created_at`, `updated_at` - Timestamps

### 2. Deploy
The backend automatically detects Supabase configuration and uses persistent storage when available:

```python
if USE_SUPABASE:
    # Uses SupabaseChatKitStore - conversations persist
else:
    # Uses MemoryStore - conversations lost on restart
```

### 3. How It Works

**Thread Creation:**
- When a new conversation starts, a thread is created in `chatkit_threads`
- The thread is automatically linked to the active opportunity
- Title is auto-generated based on the first message

**Message Storage:**
- Every message (user and assistant) is stored in `chatkit_thread_items`
- Messages are serialized as JSONB for flexible storage
- Full conversation history is preserved

**Thread Retrieval:**
- Threads are loaded from database on page refresh
- Messages are paginated for performance
- Threads are sorted by most recent activity

**Opportunity Linking:**
- Each thread is linked to the opportunity that was active when it was created
- When you switch opportunities, you can see all past conversations for that opportunity
- Threads persist even after opportunity is completed

### 4. Benefits

✅ **Conversations survive server restarts**
✅ **Full conversation history per opportunity**
✅ **Context is never lost**
✅ **Can review past discussions**
✅ **Supports multiple concurrent opportunities**

### 5. Migration Notes

**Existing conversations** (in memory) will be lost on first deployment with this feature. After deployment, all new conversations will be persistent.

If you need to preserve existing conversations, export them before deploying this update.

## Technical Details

**Store Implementation:** `backend/app/supabase_chatkit_store.py`
- Implements ChatKit's `Store` interface
- Uses Supabase client for all operations
- Handles serialization/deserialization of ThreadItem objects

**Schema:** `supabase_schema.sql`
- CASCADE delete ensures cleanup when opportunities are deleted
- Indexes optimize query performance
- JSONB storage allows flexible message formats

**Integration:** `backend/app/chat.py`
- Conditional store selection based on environment
- Automatic opportunity linking
- Thread title generation
