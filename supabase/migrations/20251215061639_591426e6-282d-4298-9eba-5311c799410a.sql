-- Create increment_template_usage RPC function
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE strategic_plans
  SET 
    usage_count = COALESCE(usage_count, 0) + 1,
    updated_at = now()
  WHERE id = template_id
    AND is_template = true;
END;
$$;

-- Create rate_template function for template rating
CREATE OR REPLACE FUNCTION public.rate_template(
  p_template_id uuid,
  p_rating numeric,
  p_user_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_rating numeric;
  v_current_reviews integer;
  v_new_rating numeric;
  v_new_reviews integer;
BEGIN
  -- Get current values
  SELECT template_rating, template_reviews 
  INTO v_current_rating, v_current_reviews
  FROM strategic_plans
  WHERE id = p_template_id AND is_template = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found');
  END IF;
  
  -- Calculate new average
  v_current_rating := COALESCE(v_current_rating, 0);
  v_current_reviews := COALESCE(v_current_reviews, 0);
  v_new_reviews := v_current_reviews + 1;
  v_new_rating := ((v_current_rating * v_current_reviews) + p_rating) / v_new_reviews;
  
  -- Update template
  UPDATE strategic_plans
  SET 
    template_rating = ROUND(v_new_rating, 1),
    template_reviews = v_new_reviews,
    updated_at = now()
  WHERE id = p_template_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_rating', ROUND(v_new_rating, 1),
    'total_reviews', v_new_reviews
  );
END;
$$;

-- Insert seed/system templates
INSERT INTO strategic_plans (
  name_en, name_ar, description_en, description_ar,
  is_template, template_type, template_category, is_public, is_featured,
  status, owner_email,
  vision_en, mission_en,
  objectives, kpis, pillars, stakeholders,
  template_tags
) VALUES 
(
  'Digital Transformation Blueprint',
  'مخطط التحول الرقمي',
  'Comprehensive framework for municipality digital transformation initiatives with AI integration, cloud migration, and citizen service digitization.',
  'إطار شامل لمبادرات التحول الرقمي في البلدية مع التكامل مع الذكاء الاصطناعي والانتقال للسحابة ورقمنة خدمات المواطنين.',
  true, 'digital_transformation', 'system', true, true,
  'template', 'system@lovable.dev',
  'To become a digitally-enabled municipality delivering seamless services',
  'Leverage technology to enhance citizen experience and operational efficiency',
  '[{"id": "obj-1", "title_en": "Digitize 80% of citizen services", "priority": "high"}, {"id": "obj-2", "title_en": "Implement AI-powered decision support", "priority": "medium"}, {"id": "obj-3", "title_en": "Achieve 95% system uptime", "priority": "high"}]'::jsonb,
  '[{"id": "kpi-1", "name_en": "Digital service adoption rate", "target": 80, "unit": "%"}, {"id": "kpi-2", "name_en": "Average transaction time reduction", "target": 50, "unit": "%"}]'::jsonb,
  '["Digital Infrastructure", "Citizen Services", "Data Analytics", "Cybersecurity"]'::jsonb,
  '[{"name": "IT Department", "type": "internal", "influence": "high"}, {"name": "Citizens", "type": "external", "influence": "high"}]'::jsonb,
  ARRAY['digital', 'transformation', 'AI', 'cloud', 'e-services']
),
(
  'Sustainability & Green Initiative',
  'مبادرة الاستدامة والبيئة الخضراء',
  'Strategic framework for environmental sustainability, carbon neutrality, and green infrastructure development.',
  'إطار استراتيجي للاستدامة البيئية والحياد الكربوني وتطوير البنية التحتية الخضراء.',
  true, 'sustainability', 'system', true, true,
  'template', 'system@lovable.dev',
  'To be a carbon-neutral municipality by 2030',
  'Implement sustainable practices across all municipal operations',
  '[{"id": "obj-1", "title_en": "Reduce carbon emissions by 40%", "priority": "high"}, {"id": "obj-2", "title_en": "Increase renewable energy usage to 50%", "priority": "high"}, {"id": "obj-3", "title_en": "Achieve zero waste to landfill", "priority": "medium"}]'::jsonb,
  '[{"id": "kpi-1", "name_en": "CO2 emissions reduction", "target": 40, "unit": "%"}, {"id": "kpi-2", "name_en": "Renewable energy percentage", "target": 50, "unit": "%"}]'::jsonb,
  '["Clean Energy", "Waste Management", "Green Transportation", "Sustainable Building"]'::jsonb,
  '[{"name": "Environmental Agency", "type": "government", "influence": "high"}, {"name": "Community", "type": "external", "influence": "medium"}]'::jsonb,
  ARRAY['sustainability', 'green', 'environment', 'carbon-neutral', 'renewable']
),
(
  'Smart City Innovation Framework',
  'إطار ابتكار المدينة الذكية',
  'Holistic approach to smart city development including IoT, data-driven governance, and intelligent infrastructure.',
  'نهج شامل لتطوير المدينة الذكية بما في ذلك إنترنت الأشياء والحوكمة القائمة على البيانات والبنية التحتية الذكية.',
  true, 'smart_city', 'system', true, true,
  'template', 'system@lovable.dev',
  'To create a connected, intelligent, and responsive urban environment',
  'Deploy smart technologies to improve quality of life and city operations',
  '[{"id": "obj-1", "title_en": "Deploy city-wide IoT sensor network", "priority": "high"}, {"id": "obj-2", "title_en": "Launch integrated command center", "priority": "high"}, {"id": "obj-3", "title_en": "Implement predictive maintenance", "priority": "medium"}]'::jsonb,
  '[{"id": "kpi-1", "name_en": "IoT sensor coverage", "target": 90, "unit": "%"}, {"id": "kpi-2", "name_en": "Incident response time", "target": -30, "unit": "% reduction"}]'::jsonb,
  '["IoT Infrastructure", "Data Platform", "Smart Mobility", "Connected Services"]'::jsonb,
  '[{"name": "Tech Partners", "type": "private", "influence": "high"}, {"name": "Urban Planning", "type": "internal", "influence": "high"}]'::jsonb,
  ARRAY['smart-city', 'IoT', 'data-driven', 'innovation', 'urban']
),
(
  'Citizen Services Excellence',
  'التميز في خدمات المواطنين',
  'Framework focused on improving citizen experience through service optimization, accessibility, and responsiveness.',
  'إطار يركز على تحسين تجربة المواطن من خلال تحسين الخدمات وسهولة الوصول والاستجابة.',
  true, 'citizen_services', 'system', true, true,
  'template', 'system@lovable.dev',
  'To deliver world-class citizen services with excellence',
  'Put citizens at the center of everything we do',
  '[{"id": "obj-1", "title_en": "Achieve 90% citizen satisfaction", "priority": "high"}, {"id": "obj-2", "title_en": "Reduce service wait times by 60%", "priority": "high"}, {"id": "obj-3", "title_en": "Launch omnichannel service delivery", "priority": "medium"}]'::jsonb,
  '[{"id": "kpi-1", "name_en": "Citizen satisfaction score", "target": 90, "unit": "%"}, {"id": "kpi-2", "name_en": "First contact resolution rate", "target": 85, "unit": "%"}]'::jsonb,
  '["Service Design", "Accessibility", "Feedback Systems", "Staff Training"]'::jsonb,
  '[{"name": "Citizens", "type": "external", "influence": "high"}, {"name": "Service Staff", "type": "internal", "influence": "high"}]'::jsonb,
  ARRAY['citizen', 'services', 'excellence', 'satisfaction', 'accessibility']
),
(
  'Innovation & R&D Strategy',
  'استراتيجية الابتكار والبحث والتطوير',
  'Strategic plan for fostering innovation culture, R&D investments, and partnership ecosystems.',
  'خطة استراتيجية لتعزيز ثقافة الابتكار واستثمارات البحث والتطوير وأنظمة الشراكة.',
  true, 'innovation', 'system', true, true,
  'template', 'system@lovable.dev',
  'To be recognized as a leading innovation hub in the region',
  'Foster creativity and experimentation to solve municipal challenges',
  '[{"id": "obj-1", "title_en": "Launch innovation lab", "priority": "high"}, {"id": "obj-2", "title_en": "Establish 10 strategic partnerships", "priority": "medium"}, {"id": "obj-3", "title_en": "Pilot 20 innovative solutions annually", "priority": "high"}]'::jsonb,
  '[{"id": "kpi-1", "name_en": "Innovation projects launched", "target": 20, "unit": "count"}, {"id": "kpi-2", "name_en": "R&D budget allocation", "target": 5, "unit": "% of budget"}]'::jsonb,
  '["Innovation Culture", "R&D Investment", "Partnerships", "Incubation"]'::jsonb,
  '[{"name": "Universities", "type": "academic", "influence": "high"}, {"name": "Startups", "type": "private", "influence": "medium"}]'::jsonb,
  ARRAY['innovation', 'R&D', 'partnerships', 'incubation', 'creativity']
)
ON CONFLICT (id) DO NOTHING;