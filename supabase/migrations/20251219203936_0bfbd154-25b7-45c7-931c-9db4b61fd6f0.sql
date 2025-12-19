
-- Organizations System Comprehensive Fix Migration
-- Add missing columns and performance indexes

-- Add missing columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS org_type text;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS code text;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS location text;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS sectors text[];

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS specializations text[];

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS capabilities text[];

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS team_size text;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS maturity_level text;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS founding_year integer;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS employee_count integer;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS funding_stage text;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS annual_revenue_range text;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS funding_rounds jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS key_investors jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS certifications text[];

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS licenses text[];

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS partnership_agreements jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS regulatory_compliance jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS intellectual_property jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS is_partner boolean DEFAULT false;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS partnership_status text DEFAULT 'none';

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS partnership_type text;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS partnership_date timestamp with time zone;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS municipality_id uuid REFERENCES municipalities(id);

-- Sync org_type with type for existing records
UPDATE public.organizations 
SET org_type = type 
WHERE org_type IS NULL AND type IS NOT NULL;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_org_type ON public.organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_is_verified ON public.organizations(is_verified);
CREATE INDEX IF NOT EXISTS idx_organizations_is_deleted ON public.organizations(is_deleted);
CREATE INDEX IF NOT EXISTS idx_organizations_sector_id ON public.organizations(sector_id);
CREATE INDEX IF NOT EXISTS idx_organizations_region_id ON public.organizations(region_id);
CREATE INDEX IF NOT EXISTS idx_organizations_city_id ON public.organizations(city_id);
CREATE INDEX IF NOT EXISTS idx_organizations_municipality_id ON public.organizations(municipality_id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON public.organizations(created_at);
CREATE INDEX IF NOT EXISTS idx_organizations_is_partner ON public.organizations(is_partner);
CREATE INDEX IF NOT EXISTS idx_organizations_partnership_status ON public.organizations(partnership_status);

-- Add RLS policies for organizations
CREATE POLICY "Municipality staff can view own organizations"
ON public.organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id = organizations.municipality_id
      AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'municipality director', 'municipality manager'])
  )
);

CREATE POLICY "Deputyship staff can view all organizations"
ON public.organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND lower(r.name) = ANY(ARRAY['deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager'])
  )
);

CREATE POLICY "Provider staff can view own organization"
ON public.organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.organization_id = organizations.id
  )
);

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Organization members can update own organization"
ON public.organizations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.organization_id = organizations.id
  )
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id = organizations.municipality_id
      AND lower(r.name) = ANY(ARRAY['municipality admin', 'municipality director'])
  )
);

-- Enable realtime for organizations
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;
