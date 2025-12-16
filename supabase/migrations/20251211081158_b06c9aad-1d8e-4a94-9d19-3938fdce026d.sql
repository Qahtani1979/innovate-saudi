-- Create ministries table
CREATE TABLE public.ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  code TEXT UNIQUE,
  logo_url TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view active ministries" ON public.ministries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage ministries" ON public.ministries
  FOR ALL USING (is_admin(auth.uid()));

-- Add ministry_id to municipalities
ALTER TABLE public.municipalities 
ADD COLUMN ministry_id UUID REFERENCES public.ministries(id);

-- Insert MoMAH
INSERT INTO public.ministries (name_en, name_ar, code, website)
VALUES ('Ministry of Municipalities and Housing', 'وزارة البلديات والإسكان', 'MOMAH', 'https://momah.gov.sa');

-- Update all existing municipalities to belong to MoMAH
UPDATE public.municipalities 
SET ministry_id = (SELECT id FROM public.ministries WHERE code = 'MOMAH');