-- Add National region (only if not exists)
INSERT INTO public.regions (name_en, name_ar, code, is_active)
SELECT 'National', 'وطني', 'NATIONAL', true
WHERE NOT EXISTS (SELECT 1 FROM public.regions WHERE code = 'NATIONAL');

-- Add National city linked to National region (only if not exists)
INSERT INTO public.cities (name_en, name_ar, region_id, is_active)
SELECT 'National Level', 'المستوى الوطني', r.id, true
FROM public.regions r 
WHERE r.code = 'NATIONAL'
AND NOT EXISTS (SELECT 1 FROM public.cities WHERE name_en = 'National Level');