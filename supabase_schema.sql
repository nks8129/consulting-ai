-- Supabase Database Schema for Consulting AI (Multi-User)
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  description TEXT,
  current_phase TEXT NOT NULL DEFAULT 'pre_assessment',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_summary TEXT DEFAULT '',
  stakeholders TEXT[] DEFAULT '{}',
  key_insights TEXT[] DEFAULT '{}'
);

-- Phase progress table (stores progress for each phase of an opportunity)
CREATE TABLE IF NOT EXISTS phase_progress (
  id SERIAL PRIMARY KEY,
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  key_activities TEXT[] DEFAULT '{}',
  artifacts_count INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  UNIQUE(opportunity_id, phase)
);

-- Artifacts table
CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  phase TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active opportunity tracking (per user)
CREATE TABLE IF NOT EXISTS active_opportunity (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_user ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_opportunity ON artifacts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_phase ON artifacts(phase);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_phase ON opportunities(current_phase);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_phase_progress_opportunity ON phase_progress(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_active_opportunity_user ON active_opportunity(user_id);
CREATE INDEX IF NOT EXISTS idx_chatkit_threads_user ON chatkit_threads(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_opportunity ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatkit_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatkit_thread_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Opportunities policies
CREATE POLICY "Users can view own opportunities" ON opportunities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own opportunities" ON opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opportunities" ON opportunities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own opportunities" ON opportunities
  FOR DELETE USING (auth.uid() = user_id);

-- Artifacts policies (via opportunity ownership)
CREATE POLICY "Users can view artifacts of own opportunities" ON artifacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = artifacts.opportunity_id AND opportunities.user_id = auth.uid())
  );
CREATE POLICY "Users can create artifacts for own opportunities" ON artifacts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = artifacts.opportunity_id AND opportunities.user_id = auth.uid())
  );
CREATE POLICY "Users can update artifacts of own opportunities" ON artifacts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = artifacts.opportunity_id AND opportunities.user_id = auth.uid())
  );
CREATE POLICY "Users can delete artifacts of own opportunities" ON artifacts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = artifacts.opportunity_id AND opportunities.user_id = auth.uid())
  );

-- Phase progress policies (via opportunity ownership)
CREATE POLICY "Users can view phase progress of own opportunities" ON phase_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = phase_progress.opportunity_id AND opportunities.user_id = auth.uid())
  );
CREATE POLICY "Users can manage phase progress of own opportunities" ON phase_progress
  FOR ALL USING (
    EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = phase_progress.opportunity_id AND opportunities.user_id = auth.uid())
  );

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Active opportunity policies
CREATE POLICY "Users can view own active opportunity" ON active_opportunity
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own active opportunity" ON active_opportunity
  FOR ALL USING (auth.uid() = user_id);

-- ChatKit threads policies
CREATE POLICY "Users can view own threads" ON chatkit_threads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own threads" ON chatkit_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own threads" ON chatkit_threads
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own threads" ON chatkit_threads
  FOR DELETE USING (auth.uid() = user_id);

-- ChatKit thread items policies (via thread ownership)
CREATE POLICY "Users can view items of own threads" ON chatkit_thread_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chatkit_threads WHERE chatkit_threads.id = chatkit_thread_items.thread_id AND chatkit_threads.user_id = auth.uid())
  );
CREATE POLICY "Users can manage items of own threads" ON chatkit_thread_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM chatkit_threads WHERE chatkit_threads.id = chatkit_thread_items.thread_id AND chatkit_threads.user_id = auth.uid())
  );

-- Helper function to increment artifact count
CREATE OR REPLACE FUNCTION increment_artifacts_count(opp_id TEXT, phase_name TEXT)
RETURNS void AS $$
BEGIN
  UPDATE phase_progress
  SET artifacts_count = artifacts_count + 1
  WHERE opportunity_id = opp_id AND phase = phase_name;
END;
$$ LANGUAGE plpgsql;

-- ChatKit threads table (stores conversation threads)
CREATE TABLE IF NOT EXISTS chatkit_threads (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ChatKit thread items table (stores messages in threads)
CREATE TABLE IF NOT EXISTS chatkit_thread_items (
  id TEXT PRIMARY KEY,
  thread_id TEXT REFERENCES chatkit_threads(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'user_message', 'assistant_message', 'tool_call', etc.
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ChatKit tables
CREATE INDEX IF NOT EXISTS idx_chatkit_threads_opportunity ON chatkit_threads(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_chatkit_threads_created ON chatkit_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatkit_items_thread ON chatkit_thread_items(thread_id);
CREATE INDEX IF NOT EXISTS idx_chatkit_items_created ON chatkit_thread_items(created_at);

COMMENT ON TABLE opportunities IS 'Consulting engagement opportunities';
COMMENT ON TABLE artifacts IS 'Documents, notes, and deliverables for opportunities';
COMMENT ON TABLE tasks IS 'Tasks for consulting engagements';
COMMENT ON TABLE phase_progress IS 'Progress tracking for each phase of an opportunity';
COMMENT ON TABLE active_opportunity IS 'Tracks which opportunity is currently active (single row table)';
COMMENT ON TABLE chatkit_threads IS 'ChatKit conversation threads linked to opportunities';
COMMENT ON TABLE chatkit_thread_items IS 'Messages and items within ChatKit threads';
