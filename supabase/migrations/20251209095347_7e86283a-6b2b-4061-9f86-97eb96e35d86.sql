-- Seed sectors table with comprehensive expertise areas
INSERT INTO public.sectors (id, name_en, name_ar, code, description_en, description_ar, icon, is_active) VALUES
  (gen_random_uuid(), 'Urban Planning', 'التخطيط الحضري', 'urban_planning', 'City planning and urban development', 'التخطيط المدني والتطوير الحضري', 'MapPin', true),
  (gen_random_uuid(), 'Smart City', 'المدن الذكية', 'smart_city', 'Smart city technologies and IoT', 'تقنيات المدن الذكية وإنترنت الأشياء', 'Cpu', true),
  (gen_random_uuid(), 'Sustainability', 'الاستدامة', 'sustainability', 'Environmental sustainability and green initiatives', 'الاستدامة البيئية والمبادرات الخضراء', 'Leaf', true),
  (gen_random_uuid(), 'Transportation', 'النقل', 'transportation', 'Public transport and mobility solutions', 'النقل العام وحلول التنقل', 'Car', true),
  (gen_random_uuid(), 'Public Services', 'الخدمات العامة', 'public_services', 'Municipal and government services', 'الخدمات البلدية والحكومية', 'Building2', true),
  (gen_random_uuid(), 'AI & Technology', 'الذكاء الاصطناعي والتقنية', 'ai_technology', 'Artificial intelligence and emerging tech', 'الذكاء الاصطناعي والتقنيات الناشئة', 'Brain', true),
  (gen_random_uuid(), 'Energy', 'الطاقة', 'energy', 'Energy efficiency and renewable energy', 'كفاءة الطاقة والطاقة المتجددة', 'Zap', true),
  (gen_random_uuid(), 'Healthcare', 'الرعاية الصحية', 'healthcare', 'Public health and medical services', 'الصحة العامة والخدمات الطبية', 'Heart', true),
  (gen_random_uuid(), 'Education', 'التعليم', 'education', 'Education and learning initiatives', 'مبادرات التعليم والتعلم', 'GraduationCap', true),
  (gen_random_uuid(), 'Environment', 'البيئة', 'environment', 'Environmental protection and climate', 'حماية البيئة والمناخ', 'TreePine', true),
  (gen_random_uuid(), 'Water Resources', 'الموارد المائية', 'water_resources', 'Water management and conservation', 'إدارة المياه والحفاظ عليها', 'Droplet', true),
  (gen_random_uuid(), 'Waste Management', 'إدارة النفايات', 'waste_management', 'Waste handling and recycling', 'معالجة النفايات وإعادة التدوير', 'Trash2', true),
  (gen_random_uuid(), 'Public Safety', 'السلامة العامة', 'public_safety', 'Safety, security, and emergency services', 'السلامة والأمن وخدمات الطوارئ', 'Shield', true),
  (gen_random_uuid(), 'Digital Services', 'الخدمات الرقمية', 'digital_services', 'E-government and digital transformation', 'الحكومة الإلكترونية والتحول الرقمي', 'Globe', true),
  (gen_random_uuid(), 'Tourism & Culture', 'السياحة والثقافة', 'tourism_culture', 'Tourism development and cultural heritage', 'تطوير السياحة والتراث الثقافي', 'Landmark', true),
  (gen_random_uuid(), 'Housing', 'الإسكان', 'housing', 'Affordable housing and real estate', 'الإسكان الميسر والعقارات', 'Home', true),
  (gen_random_uuid(), 'Agriculture', 'الزراعة', 'agriculture', 'Urban farming and food security', 'الزراعة الحضرية والأمن الغذائي', 'Sprout', true),
  (gen_random_uuid(), 'Sports & Recreation', 'الرياضة والترفيه', 'sports_recreation', 'Sports facilities and leisure activities', 'المرافق الرياضية والأنشطة الترفيهية', 'Dumbbell', true),
  (gen_random_uuid(), 'Social Services', 'الخدمات الاجتماعية', 'social_services', 'Community welfare and social programs', 'الرفاه المجتمعي والبرامج الاجتماعية', 'Users', true),
  (gen_random_uuid(), 'Infrastructure', 'البنية التحتية', 'infrastructure', 'Roads, bridges, and public infrastructure', 'الطرق والجسور والبنية التحتية العامة', 'Construction', true)
ON CONFLICT DO NOTHING;

-- Create custom_expertise_areas table for user-submitted expertise
CREATE TABLE IF NOT EXISTS public.custom_expertise_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  submitted_by_email TEXT NOT NULL,
  submitted_by_user_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
  ai_validation_score NUMERIC(3,2),
  ai_validation_notes TEXT,
  similar_to_sector_id UUID REFERENCES public.sectors(id),
  merged_into_sector_id UUID REFERENCES public.sectors(id),
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_expertise_areas ENABLE ROW LEVEL SECURITY;

-- Users can view approved custom expertise
CREATE POLICY "Anyone can view approved expertise" ON public.custom_expertise_areas
  FOR SELECT USING (status = 'approved');

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.custom_expertise_areas
  FOR SELECT USING (submitted_by_email = auth.jwt()->>'email');

-- Users can submit custom expertise
CREATE POLICY "Authenticated users can submit expertise" ON public.custom_expertise_areas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can manage all
CREATE POLICY "Admins can manage expertise" ON public.custom_expertise_areas
  FOR ALL USING (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_custom_expertise_updated_at
  BEFORE UPDATE ON public.custom_expertise_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();