-- Phase 6: Add strategic fields to policy_documents and global_trends

-- Add strategic fields to policy_documents
ALTER TABLE public.policy_documents
ADD COLUMN IF NOT EXISTS strategic_plan_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_objective_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false;

-- Add strategic fields to global_trends
ALTER TABLE public.global_trends
ADD COLUMN IF NOT EXISTS strategic_plan_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_relevance_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS linked_objective_ids uuid[] DEFAULT '{}';