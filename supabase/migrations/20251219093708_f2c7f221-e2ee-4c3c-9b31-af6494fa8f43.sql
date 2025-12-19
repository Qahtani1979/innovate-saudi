-- Create system_validations table to persist validation checklist status
CREATE TABLE public.system_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT NOT NULL,
  system_name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  check_id TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  checked_by TEXT,
  checked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(system_id, category_id, check_id)
);

-- Create system_validation_summaries for tracking overall progress per system
CREATE TABLE public.system_validation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT NOT NULL UNIQUE,
  system_name TEXT NOT NULL,
  total_checks INTEGER DEFAULT 0,
  completed_checks INTEGER DEFAULT 0,
  critical_completed INTEGER DEFAULT 0,
  critical_total INTEGER DEFAULT 0,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  last_validated_by TEXT,
  status TEXT DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_validation_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "Admins can manage system validations"
ON public.system_validations
FOR ALL
TO authenticated
USING (public.has_permission(auth.uid(), 'system:manage'))
WITH CHECK (public.has_permission(auth.uid(), 'system:manage'));

CREATE POLICY "Admins can manage validation summaries"
ON public.system_validation_summaries
FOR ALL
TO authenticated
USING (public.has_permission(auth.uid(), 'system:manage'))
WITH CHECK (public.has_permission(auth.uid(), 'system:manage'));

-- Trigger for updated_at
CREATE TRIGGER update_system_validations_updated_at
BEFORE UPDATE ON public.system_validations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_validation_summaries_updated_at
BEFORE UPDATE ON public.system_validation_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();