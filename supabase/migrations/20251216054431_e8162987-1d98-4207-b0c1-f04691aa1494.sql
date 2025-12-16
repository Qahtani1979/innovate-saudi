-- Fix incorrect ministry name in ministries table
UPDATE public.ministries 
SET name_en = 'Ministry of Municipalities and Housing',
    name_ar = 'وزارة البلديات والإسكان'
WHERE code = 'MOMAH';

-- Fix incorrect municipality name if it exists
UPDATE public.municipalities 
SET name_en = 'Ministry of Municipalities and Housing (National)',
    name_ar = 'وزارة البلديات والإسكان (المستوى الوطني)'
WHERE name_en LIKE '%Municipal and Rural Affairs%' 
   OR name_ar LIKE '%الشؤون البلدية والقروية%';