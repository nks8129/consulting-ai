-- Supabase Database Schema for Consulting AI
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
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
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active opportunity tracking (stores which opportunity is currently active)
CREATE TABLE IF NOT EXISTS active_opportunity (
  id SERIAL PRIMARY KEY,
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial active opportunity row (only one row should exist)
INSERT INTO active_opportunity (opportunity_id) VALUES (NULL)
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artifacts_opportunity ON artifacts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_phase ON artifacts(phase);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_phase ON opportunities(current_phase);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_phase_progress_opportunity ON phase_progress(opportunity_id);

-- Enable Row Level Security (RLS) - Optional for now, can enable later with auth
-- ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (remove these when you add authentication)
-- For now, allow all operations for testing
-- When you add auth, replace these with proper user-based policies

-- Helper function to increment artifact count
CREATE OR REPLACE FUNCTION increment_artifacts_count(opp_id TEXT, phase_name TEXT)
RETURNS void AS $$
BEGIN
  UPDATE phase_progress
  SET artifacts_count = artifacts_count + 1
  WHERE opportunity_id = opp_id AND phase = phase_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE opportunities IS 'Consulting engagement opportunities';
COMMENT ON TABLE artifacts IS 'Documents, notes, and deliverables for opportunities';
COMMENT ON TABLE tasks IS 'Tasks for consulting engagements';
COMMENT ON TABLE phase_progress IS 'Progress tracking for each phase of an opportunity';
COMMENT ON TABLE active_opportunity IS 'Tracks which opportunity is currently active (single row table)';
