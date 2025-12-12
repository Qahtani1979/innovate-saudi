-- Media Usage Tracking Table
-- Tracks all references to media files across entities for cascade operations

CREATE TABLE IF NOT EXISTS public.media_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID REFERENCES public.media_files(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  usage_type TEXT DEFAULT 'reference',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(media_file_id, entity_type, entity_id, field_name)
);

-- Indexes for fast lookups
CREATE INDEX idx_media_usages_media_file_id ON public.media_usages(media_file_id);
CREATE INDEX idx_media_usages_entity ON public.media_usages(entity_type, entity_id);
CREATE INDEX idx_media_usages_lookup ON public.media_usages(media_file_id, entity_type);

-- Enable RLS
ALTER TABLE public.media_usages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view media usages"
ON public.media_usages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage media usages"
ON public.media_usages FOR ALL
USING (auth.uid() IS NOT NULL);

-- Function to get media usage count
CREATE OR REPLACE FUNCTION public.get_media_usage_count(p_media_file_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM media_usages WHERE media_file_id = p_media_file_id;
$$;

-- Function to check if media can be safely deleted
CREATE OR REPLACE FUNCTION public.can_delete_media(p_media_file_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usage_count INTEGER;
  usages JSONB;
BEGIN
  SELECT COUNT(*) INTO usage_count FROM media_usages WHERE media_file_id = p_media_file_id;
  
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'entity_type', entity_type,
    'entity_id', entity_id,
    'field_name', field_name,
    'is_primary', is_primary
  )), '[]'::jsonb)
  INTO usages
  FROM media_usages
  WHERE media_file_id = p_media_file_id
  LIMIT 10;
  
  RETURN jsonb_build_object(
    'can_delete', usage_count = 0,
    'usage_count', usage_count,
    'usages', usages
  );
END;
$$;

-- Function to safely delete media with cascade option
CREATE OR REPLACE FUNCTION public.delete_media_with_cascade(
  p_media_file_id UUID,
  p_cascade_action TEXT DEFAULT 'nullify'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage RECORD;
  v_affected_count INTEGER := 0;
  v_media_url TEXT;
BEGIN
  -- Get the media URL for updating references
  SELECT public_url INTO v_media_url FROM media_files WHERE id = p_media_file_id;
  
  IF p_cascade_action = 'nullify' THEN
    -- Update each entity to nullify the reference
    FOR v_usage IN SELECT * FROM media_usages WHERE media_file_id = p_media_file_id
    LOOP
      -- Dynamic SQL to nullify references based on entity type
      EXECUTE format(
        'UPDATE %I SET %I = NULL, updated_at = now() WHERE id = $1',
        v_usage.entity_type,
        v_usage.field_name
      ) USING v_usage.entity_id;
      v_affected_count := v_affected_count + 1;
    END LOOP;
  END IF;
  
  -- Soft delete the media file
  UPDATE media_files 
  SET is_deleted = true, deleted_at = now()
  WHERE id = p_media_file_id;
  
  -- Delete usage records
  DELETE FROM media_usages WHERE media_file_id = p_media_file_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'affected_entities', v_affected_count,
    'action', p_cascade_action
  );
END;
$$;

-- Trigger to update media_usages updated_at
CREATE TRIGGER update_media_usages_updated_at
BEFORE UPDATE ON public.media_usages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();