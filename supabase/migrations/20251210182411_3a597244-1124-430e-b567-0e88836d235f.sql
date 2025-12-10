-- Add approved email domains column to municipalities table for staff auto-approval
ALTER TABLE public.municipalities 
ADD COLUMN IF NOT EXISTS approved_email_domains text[] DEFAULT '{}';

-- Add comment explaining the field
COMMENT ON COLUMN public.municipalities.approved_email_domains IS 'Email domains that allow automatic staff role approval (e.g., ["gov.sa", "municipality.gov.sa"])';