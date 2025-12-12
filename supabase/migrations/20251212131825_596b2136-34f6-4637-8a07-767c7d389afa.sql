-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to trigger MII recalculation when challenges change
CREATE OR REPLACE FUNCTION public.trigger_mii_recalculation_on_challenge()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger
  RAISE NOTICE 'Challenge changed for municipality %, queuing MII recalculation', COALESCE(NEW.municipality_id, OLD.municipality_id);
  
  -- Update a flag or timestamp that can be checked by scheduled job
  -- For now, we'll update the municipality's updated_at to signal a change
  UPDATE public.municipalities 
  SET updated_at = now()
  WHERE id = COALESCE(NEW.municipality_id, OLD.municipality_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to trigger MII recalculation when pilots change
CREATE OR REPLACE FUNCTION public.trigger_mii_recalculation_on_pilot()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Pilot changed for municipality %, queuing MII recalculation', COALESCE(NEW.municipality_id, OLD.municipality_id);
  
  UPDATE public.municipalities 
  SET updated_at = now()
  WHERE id = COALESCE(NEW.municipality_id, OLD.municipality_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to trigger MII recalculation when partnerships change
CREATE OR REPLACE FUNCTION public.trigger_mii_recalculation_on_partnership()
RETURNS TRIGGER AS $$
DECLARE
  mun_id uuid;
BEGIN
  -- Partnerships don't have direct municipality_id, but we can update all related ones
  -- This is a simplified version - in production you'd want to be more specific
  RAISE NOTICE 'Partnership changed, flagging for MII recalculation';
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers on challenges table
DROP TRIGGER IF EXISTS trigger_mii_on_challenge_change ON public.challenges;
CREATE TRIGGER trigger_mii_on_challenge_change
AFTER INSERT OR UPDATE OR DELETE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.trigger_mii_recalculation_on_challenge();

-- Create triggers on pilots table
DROP TRIGGER IF EXISTS trigger_mii_on_pilot_change ON public.pilots;
CREATE TRIGGER trigger_mii_on_pilot_change
AFTER INSERT OR UPDATE OR DELETE ON public.pilots
FOR EACH ROW
EXECUTE FUNCTION public.trigger_mii_recalculation_on_pilot();

-- Create triggers on partnerships table
DROP TRIGGER IF EXISTS trigger_mii_on_partnership_change ON public.partnerships;
CREATE TRIGGER trigger_mii_on_partnership_change
AFTER INSERT OR UPDATE OR DELETE ON public.partnerships
FOR EACH ROW
EXECUTE FUNCTION public.trigger_mii_recalculation_on_partnership();

-- Add mii_recalc_pending flag to municipalities for tracking
ALTER TABLE public.municipalities ADD COLUMN IF NOT EXISTS mii_recalc_pending boolean DEFAULT false;
ALTER TABLE public.municipalities ADD COLUMN IF NOT EXISTS mii_last_calculated_at timestamptz;