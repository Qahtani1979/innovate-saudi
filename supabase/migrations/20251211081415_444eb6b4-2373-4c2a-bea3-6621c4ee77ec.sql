-- Update city_type check constraint to include 'national'
ALTER TABLE public.municipalities DROP CONSTRAINT municipalities_city_type_check;

ALTER TABLE public.municipalities ADD CONSTRAINT municipalities_city_type_check 
CHECK (city_type = ANY (ARRAY['metropolitan', 'major', 'medium', 'small', 'national']));

-- Insert national-level MoMAH record
INSERT INTO public.municipalities (
  name_en, 
  name_ar, 
  region, 
  city_type, 
  ministry_id,
  is_active,
  is_verified
)
VALUES (
  'Ministry of Municipalities and Housing (National)', 
  'وزارة البلديات والإسكان (المستوى الوطني)', 
  'National',
  'national',
  (SELECT id FROM ministries WHERE code = 'MOMAH'),
  true,
  true
);