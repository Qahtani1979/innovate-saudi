-- =====================================================
-- CONTENT MANAGEMENT HUB - DATABASE SCHEMA
-- =====================================================

-- 1. MEDIA FILES - Primary registry for all uploaded files
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Storage Reference
  bucket_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  
  -- File Information
  original_filename TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  alt_text TEXT,
  
  -- Technical Metadata
  mime_type TEXT,
  file_size BIGINT,
  file_extension TEXT,
  checksum TEXT,
  
  -- Dimensions (for images/videos)
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  
  -- Upload Context
  uploaded_by_user_id UUID,
  uploaded_by_email TEXT,
  upload_source TEXT DEFAULT 'web', -- 'web', 'api', 'bulk', 'migration'
  upload_context JSONB,
  
  -- Entity Association
  entity_type TEXT, -- 'challenge', 'solution', 'pilot', etc.
  entity_id UUID,
  entity_field TEXT, -- 'image_url', 'gallery', 'attachment'
  
  -- Organization & Categorization
  folder_path TEXT,
  tags TEXT[],
  category TEXT, -- 'primary', 'gallery', 'document', 'attachment'
  
  -- Access & Analytics
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  -- Lifecycle
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'pending_deletion'
  expires_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  archived_by TEXT,
  
  -- AI/Processing
  ai_description TEXT,
  ai_tags TEXT[],
  is_processed BOOLEAN DEFAULT false,
  processing_metadata JSONB,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by TEXT,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Constraints
  UNIQUE(bucket_id, storage_path)
);

-- 2. MEDIA USAGE - Track where files are used
CREATE TABLE public.media_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  
  -- Where it's used
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  
  -- Context
  usage_type TEXT, -- 'primary', 'gallery', 'attachment', 'inline'
  display_order INTEGER,
  
  -- Tracking
  added_by TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  removed_at TIMESTAMPTZ,
  
  -- Unique constraint to prevent duplicates
  UNIQUE(media_file_id, entity_type, entity_id, field_name)
);

-- 3. MEDIA VERSIONS - Version history for replaced files
CREATE TABLE public.media_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  
  -- Previous state
  previous_storage_path TEXT,
  previous_file_size BIGINT,
  previous_checksum TEXT,
  
  -- Change info
  change_type TEXT, -- 'replace', 'crop', 'resize', 'metadata_update'
  changed_by TEXT,
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MEDIA FOLDERS - Virtual folder organization
CREATE TABLE public.media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  
  -- Hierarchy
  parent_folder_id UUID REFERENCES media_folders(id),
  path TEXT NOT NULL,
  depth INTEGER DEFAULT 0,
  
  -- Scope
  bucket_id TEXT,
  entity_type TEXT,
  
  -- Permissions
  owner_user_id UUID,
  owner_email TEXT,
  is_shared BOOLEAN DEFAULT false,
  shared_with TEXT[],
  
  -- Metadata
  description TEXT,
  icon TEXT,
  color TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(path)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary lookup indexes
CREATE INDEX idx_media_files_bucket ON media_files(bucket_id);
CREATE INDEX idx_media_files_entity ON media_files(entity_type, entity_id);
CREATE INDEX idx_media_files_uploader ON media_files(uploaded_by_user_id);
CREATE INDEX idx_media_files_uploader_email ON media_files(uploaded_by_email);
CREATE INDEX idx_media_files_status ON media_files(status) WHERE is_deleted = false;
CREATE INDEX idx_media_files_created ON media_files(created_at DESC);
CREATE INDEX idx_media_files_accessed ON media_files(last_accessed_at DESC NULLS LAST);

-- Search indexes
CREATE INDEX idx_media_files_tags ON media_files USING GIN(tags);
CREATE INDEX idx_media_files_mime ON media_files(mime_type);

-- Usage tracking indexes
CREATE INDEX idx_media_usage_file ON media_usage(media_file_id);
CREATE INDEX idx_media_usage_entity ON media_usage(entity_type, entity_id);

-- Folder indexes
CREATE INDEX idx_media_folders_parent ON media_folders(parent_folder_id);
CREATE INDEX idx_media_folders_bucket ON media_folders(bucket_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;

-- MEDIA FILES POLICIES

-- Anyone authenticated can view public, non-deleted files
CREATE POLICY "View public media files"
ON media_files FOR SELECT
USING (is_public = true AND is_deleted = false);

-- Users can view their own uploads
CREATE POLICY "View own media files"
ON media_files FOR SELECT
USING (uploaded_by_user_id = auth.uid());

-- Authenticated users can insert
CREATE POLICY "Insert media files"
ON media_files FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own uploads
CREATE POLICY "Update own media files"
ON media_files FOR UPDATE
USING (uploaded_by_user_id = auth.uid());

-- Admins can update any media files
CREATE POLICY "Admin update media files"
ON media_files FOR UPDATE
USING (is_admin(auth.uid()));

-- Users can soft delete their own uploads
CREATE POLICY "Delete own media files"
ON media_files FOR DELETE
USING (uploaded_by_user_id = auth.uid());

-- Admins can delete any media files
CREATE POLICY "Admin delete media files"
ON media_files FOR DELETE
USING (is_admin(auth.uid()));

-- MEDIA USAGE POLICIES

-- View usage for accessible media
CREATE POLICY "View media usage"
ON media_usage FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM media_files mf 
    WHERE mf.id = media_file_id 
    AND (mf.is_public = true OR mf.uploaded_by_user_id = auth.uid())
  )
);

-- Insert usage for own media or admin
CREATE POLICY "Insert media usage"
ON media_usage FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Update/delete usage
CREATE POLICY "Manage media usage"
ON media_usage FOR ALL
USING (auth.uid() IS NOT NULL);

-- MEDIA VERSIONS POLICIES
CREATE POLICY "View media versions"
ON media_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM media_files mf 
    WHERE mf.id = media_file_id 
    AND (mf.is_public = true OR mf.uploaded_by_user_id = auth.uid())
  )
);

CREATE POLICY "Insert media versions"
ON media_versions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- MEDIA FOLDERS POLICIES
CREATE POLICY "View media folders"
ON media_folders FOR SELECT
USING (
  is_shared = true OR 
  owner_user_id = auth.uid() OR
  auth.jwt()->>'email' = ANY(shared_with)
);

CREATE POLICY "Manage own folders"
ON media_folders FOR ALL
USING (owner_user_id = auth.uid() OR is_admin(auth.uid()));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_media_files_updated_at
BEFORE UPDATE ON media_files
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_folders_updated_at
BEFORE UPDATE ON media_folders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTION: Increment view count
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_media_view(p_media_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE media_files 
  SET 
    view_count = view_count + 1,
    last_accessed_at = now()
  WHERE id = p_media_id;
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Increment download count
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_media_download(p_media_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE media_files 
  SET 
    download_count = download_count + 1,
    last_accessed_at = now()
  WHERE id = p_media_id;
END;
$$;