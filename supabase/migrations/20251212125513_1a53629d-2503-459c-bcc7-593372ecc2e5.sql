-- ===========================================
-- MII Data Architecture Migration
-- ===========================================

-- Phase 1: Add missing columns to mii_results
ALTER TABLE mii_results ADD COLUMN IF NOT EXISTS strengths jsonb;
ALTER TABLE mii_results ADD COLUMN IF NOT EXISTS improvement_areas jsonb;
ALTER TABLE mii_results ADD COLUMN IF NOT EXISTS trend text;

-- Add check constraint for trend values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'mii_results_trend_check'
  ) THEN
    ALTER TABLE mii_results ADD CONSTRAINT mii_results_trend_check 
      CHECK (trend IS NULL OR trend IN ('up', 'down', 'stable'));
  END IF;
END $$;

-- Phase 2: Seed mii_dimensions with 6 standard dimensions
INSERT INTO mii_dimensions (id, code, name_en, name_ar, weight, sort_order, is_active, description_en, description_ar)
VALUES
  (gen_random_uuid(), 'LEADERSHIP', 'Leadership & Governance', 'القيادة والحوكمة', 0.20, 1, true, 'Vision clarity, commitment, and resource allocation', 'وضوح الرؤية والالتزام وتخصيص الموارد'),
  (gen_random_uuid(), 'STRATEGY', 'Innovation Strategy', 'استراتيجية الابتكار', 0.15, 2, true, 'Innovation roadmap and goal alignment', 'خارطة طريق الابتكار ومواءمة الأهداف'),
  (gen_random_uuid(), 'CULTURE', 'Innovation Culture', 'ثقافة الابتكار', 0.15, 3, true, 'Risk tolerance and experimentation mindset', 'تقبل المخاطر وعقلية التجريب'),
  (gen_random_uuid(), 'PARTNERSHIPS', 'Partnerships & Ecosystem', 'الشراكات والنظام البيئي', 0.15, 4, true, 'Private sector, academia, and cross-municipality collaboration', 'التعاون مع القطاع الخاص والأكاديمي والبلديات'),
  (gen_random_uuid(), 'CAPABILITIES', 'Capabilities & Resources', 'القدرات والموارد', 0.15, 5, true, 'Digital maturity, talent, and infrastructure', 'النضج الرقمي والمواهب والبنية التحتية'),
  (gen_random_uuid(), 'IMPACT', 'Impact & Outcomes', 'الأثر والنتائج', 0.20, 6, true, 'Pilot success rates and citizen satisfaction', 'معدلات نجاح التجارب ورضا المواطنين')
ON CONFLICT DO NOTHING;

-- Phase 3: Create sync function for municipality MII score
CREATE OR REPLACE FUNCTION sync_municipality_mii()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true THEN
    UPDATE municipalities
    SET 
      mii_score = NEW.overall_score,
      mii_rank = NEW.rank,
      updated_at = now()
    WHERE id = NEW.municipality_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS after_mii_result_publish ON mii_results;
CREATE TRIGGER after_mii_result_publish
AFTER INSERT OR UPDATE ON mii_results
FOR EACH ROW
EXECUTE FUNCTION sync_municipality_mii();

-- Phase 4: Seed sample MII results for municipalities that have mii_score but no results
INSERT INTO mii_results (municipality_id, assessment_year, overall_score, dimension_scores, rank, previous_rank, is_published, trend, strengths, improvement_areas, assessment_date)
SELECT 
  m.id,
  2025,
  m.mii_score,
  jsonb_build_object(
    'LEADERSHIP', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score + 5))),
    'STRATEGY', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 3))),
    'CULTURE', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 5))),
    'PARTNERSHIPS', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 8))),
    'CAPABILITIES', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score + 2))),
    'IMPACT', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score + 8)))
  ),
  m.mii_rank,
  GREATEST(1, m.mii_rank + 2),
  true,
  'up',
  '["Strong leadership commitment", "Clear innovation vision", "Active pilot program"]'::jsonb,
  '["Partnership development", "Digital infrastructure", "Talent acquisition"]'::jsonb,
  CURRENT_DATE
FROM municipalities m
WHERE m.mii_score IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM mii_results r 
    WHERE r.municipality_id = m.id AND r.assessment_year = 2025
  );

-- Add 2024 historical data
INSERT INTO mii_results (municipality_id, assessment_year, overall_score, dimension_scores, rank, previous_rank, is_published, trend, strengths, improvement_areas, assessment_date)
SELECT 
  m.id,
  2024,
  LEAST(100, GREATEST(0, m.mii_score - 8)),
  jsonb_build_object(
    'LEADERSHIP', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 3))),
    'STRATEGY', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 8))),
    'CULTURE', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 12))),
    'PARTNERSHIPS', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 15))),
    'CAPABILITIES', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 5))),
    'IMPACT', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score)))
  ),
  GREATEST(1, m.mii_rank + 2),
  GREATEST(1, m.mii_rank + 4),
  true,
  'up',
  '["Leadership engagement"]'::jsonb,
  '["Strategy development", "Partnership building"]'::jsonb,
  '2024-06-15'::date
FROM municipalities m
WHERE m.mii_score IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM mii_results r 
    WHERE r.municipality_id = m.id AND r.assessment_year = 2024
  );

-- Add 2023 historical data
INSERT INTO mii_results (municipality_id, assessment_year, overall_score, dimension_scores, rank, previous_rank, is_published, trend, strengths, improvement_areas, assessment_date)
SELECT 
  m.id,
  2023,
  LEAST(100, GREATEST(0, m.mii_score - 15)),
  jsonb_build_object(
    'LEADERSHIP', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 10))),
    'STRATEGY', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 15))),
    'CULTURE', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 20))),
    'PARTNERSHIPS', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 22))),
    'CAPABILITIES', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 12))),
    'IMPACT', jsonb_build_object('score', LEAST(100, GREATEST(0, m.mii_score - 5)))
  ),
  GREATEST(1, m.mii_rank + 4),
  NULL,
  true,
  'stable',
  '["Initial innovation efforts"]'::jsonb,
  '["All dimensions need improvement"]'::jsonb,
  '2023-06-15'::date
FROM municipalities m
WHERE m.mii_score IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM mii_results r 
    WHERE r.municipality_id = m.id AND r.assessment_year = 2023
  );