-- Create lessons_learned table for capturing learnings from pilots, challenges, and programs
CREATE TABLE IF NOT EXISTS public.lessons_learned (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  entity_type TEXT NOT NULL, -- challenge, pilot, program, rd_project
  entity_id UUID,
  category TEXT, -- success, failure, process, technical, organizational
  impact_level TEXT, -- high, medium, low
  sector_id UUID REFERENCES public.sectors(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  key_insight_en TEXT,
  key_insight_ar TEXT,
  recommendations_en TEXT[],
  recommendations_ar TEXT[],
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons_learned ENABLE ROW LEVEL SECURITY;

-- Admin policy
CREATE POLICY "Admins can manage lessons_learned"
ON public.lessons_learned
FOR ALL
USING (is_admin(auth.uid()));

-- Public view policy
CREATE POLICY "Anyone can view published lessons_learned"
ON public.lessons_learned
FOR SELECT
USING (is_published = true);

-- Create trigger for updated_at
CREATE TRIGGER update_lessons_learned_updated_at
BEFORE UPDATE ON public.lessons_learned
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();