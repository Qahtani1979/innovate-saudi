-- Fix function search path security issue
CREATE OR REPLACE FUNCTION sync_municipality_mii()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true THEN
    UPDATE public.municipalities
    SET 
      mii_score = NEW.overall_score,
      mii_rank = NEW.rank,
      updated_at = now()
    WHERE id = NEW.municipality_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;