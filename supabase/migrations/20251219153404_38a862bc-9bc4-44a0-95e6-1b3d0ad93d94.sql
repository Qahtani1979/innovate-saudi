-- Add missing columns to delegation_rules for challenge-specific delegation
ALTER TABLE public.delegation_rules 
ADD COLUMN IF NOT EXISTS entity_type text,
ADD COLUMN IF NOT EXISTS entity_id uuid,
ADD COLUMN IF NOT EXISTS revoked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS revoked_by text;

-- Add index for entity-based lookups
CREATE INDEX IF NOT EXISTS idx_delegation_rules_entity ON public.delegation_rules(entity_type, entity_id);

-- Add index for active delegations by delegate
CREATE INDEX IF NOT EXISTS idx_delegation_rules_delegate_active ON public.delegation_rules(delegate_email, is_active) WHERE is_active = true;