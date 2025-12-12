# Content Management Hub - Design Document

## 1. Overview

The Content Management Hub is a centralized system for managing all media assets, documents, and files across the Municipal Innovation Platform. It provides comprehensive lifecycle management, metadata tracking, usage analytics, and organized storage for all platform content.

---

## 2. Objectives

### Primary Goals
- **Centralized Management**: Single interface to manage all platform media assets
- **Metadata Tracking**: Complete audit trail with uploader info, timestamps, usage context
- **Lifecycle Management**: Track file age, access patterns, retention policies
- **Usage Analytics**: Know where each file is used across the platform
- **Organized Storage**: Feature-specific buckets with clear separation

### Secondary Goals
- **Performance Optimization**: CDN-ready URLs, image transformations
- **Access Control**: Role-based visibility and management permissions
- **Bulk Operations**: Mass upload, download, delete, and tag operations
- **Search & Discovery**: Full-text search, tag filtering, smart categorization

---

## 3. Storage Architecture

### 3.1 Storage Buckets Strategy

| Bucket Name | Purpose | Public | Retention | Max Size |
|-------------|---------|--------|-----------|----------|
| `challenges` | Challenge images, attachments | Yes | Permanent | 10MB |
| `solutions` | Solution demos, screenshots | Yes | Permanent | 25MB |
| `pilots` | Pilot documentation, reports | Mixed | 5 years | 50MB |
| `programs` | Program materials, guides | Yes | Permanent | 25MB |
| `rd-projects` | Research data, papers | Mixed | 10 years | 100MB |
| `users` | Avatars, CVs, certificates | Mixed | Account lifetime | 5MB |
| `organizations` | Logos, documents | Yes | Permanent | 10MB |
| `knowledge` | Knowledge base documents | Yes | Permanent | 50MB |
| `events` | Event banners, materials | Yes | 2 years | 10MB |
| `temp` | Temporary uploads | No | 24 hours | 25MB |

### 3.2 Folder Structure per Bucket

```
{bucket_name}/
├── {entity_id}/
│   ├── primary/          # Main images (hero, thumbnail)
│   ├── gallery/          # Additional images
│   ├── documents/        # PDFs, docs
│   ├── attachments/      # Supporting files
│   └── exports/          # Generated reports
```

### 3.3 File Naming Convention

```
{entity_id}/{category}/{timestamp}_{original_name}.{ext}

Example:
challenges/abc123/primary/1734012345_smart-city-banner.jpg
```

---

## 4. Database Schema

### 4.1 Core Tables

#### `media_files` - Primary Media Registry

```sql
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
  uploaded_by_user_id UUID REFERENCES auth.users(id),
  uploaded_by_email TEXT,
  upload_source TEXT, -- 'web', 'api', 'bulk', 'migration'
  upload_context JSONB, -- Additional context data
  
  -- Entity Association
  entity_type TEXT, -- 'challenge', 'solution', 'pilot', etc.
  entity_id UUID,
  entity_field TEXT, -- 'image_url', 'gallery', 'attachment'
  
  -- Organization & Categorization
  folder_path TEXT,
  tags TEXT[],
  category TEXT,
  
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
  is_deleted BOOLEAN DEFAULT false
);
```

#### `media_usage` - Track Where Files Are Used

```sql
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
  removed_at TIMESTAMPTZ
);
```

#### `media_versions` - Version History

```sql
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
```

#### `media_folders` - Virtual Folder Organization

```sql
CREATE TABLE public.media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  
  -- Hierarchy
  parent_folder_id UUID REFERENCES media_folders(id),
  path TEXT NOT NULL, -- Full path like /challenges/2024/q1
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
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Component Architecture

### 5.1 Core Components

```
src/components/media/
├── MediaLibrary/
│   ├── MediaLibrary.jsx           # Main hub page
│   ├── MediaGrid.jsx              # Grid view of files
│   ├── MediaList.jsx              # List view of files
│   ├── MediaFilters.jsx           # Filter sidebar
│   ├── MediaSearch.jsx            # Search bar with suggestions
│   ├── MediaDetails.jsx           # File detail panel
│   ├── MediaPreview.jsx           # Preview modal
│   └── MediaActions.jsx           # Bulk action toolbar
│
├── MediaUploader/
│   ├── UnifiedMediaUploader.jsx   # Main uploader component
│   ├── UploadDropzone.jsx         # Drag & drop zone
│   ├── UploadQueue.jsx            # Upload queue display
│   ├── UploadProgress.jsx         # Progress indicators
│   └── MediaMetadataForm.jsx      # Metadata input form
│
├── MediaSelector/
│   ├── MediaPickerDialog.jsx      # Dialog for selecting media
│   ├── MediaPickerGrid.jsx        # Selection grid
│   └── MediaPickerRecent.jsx      # Recently uploaded
│
├── MediaDisplay/
│   ├── MediaImage.jsx             # Optimized image display
│   ├── MediaGallery.jsx           # Gallery component
│   ├── MediaDocument.jsx          # Document preview
│   └── MediaVideo.jsx             # Video player
│
└── hooks/
    ├── useMediaUpload.js          # Upload logic
    ├── useMediaLibrary.js         # Library operations
    ├── useMediaSearch.js          # Search functionality
    └── useMediaAnalytics.js       # Analytics tracking
```

### 5.2 Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     MediaLibrary (Hub)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │MediaFilters │  │ MediaSearch │  │   MediaActions      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │              MediaGrid / MediaList                      │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │ │
│  │  │ File │ │ File │ │ File │ │ File │ │ File │         │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    MediaDetails                         │ │
│  │  Preview │ Metadata │ Usage │ Versions │ Analytics     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. UI/UX Design

### 6.1 Media Library Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Content Management Hub                                    [👤] [⚙] │
├─────────────────────────────────────────────────────────────────────┤
│ [📁 All] [🖼 Images] [📄 Documents] [🎬 Videos] [📦 Other]  [+ Upload]│
├──────────────┬──────────────────────────────────────────────────────┤
│              │  🔍 Search files...          [Grid ▣] [List ≡]       │
│   FILTERS    ├──────────────────────────────────────────────────────┤
│              │                                                       │
│  📁 Buckets  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  ☑ All       │  │  📷    │ │  📷    │ │  📄    │ │  📷    │        │
│  ☐ challenges│  │ img1   │ │ img2   │ │ doc1   │ │ img3   │        │
│  ☐ solutions │  │ 2.3MB  │ │ 1.1MB  │ │ 450KB  │ │ 3.2MB  │        │
│  ☐ pilots    │  │ ☐      │ │ ☐      │ │ ☐      │ │ ☐      │        │
│  ☐ users     │  └────────┘ └────────┘ └────────┘ └────────┘        │
│              │                                                       │
│  🏷 Tags     │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  ☐ banner    │  │  🎬    │ │  📷    │ │  📄    │ │  📷    │        │
│  ☐ logo      │  │ video1 │ │ img4   │ │ doc2   │ │ img5   │        │
│  ☐ document  │  │ 25MB   │ │ 890KB  │ │ 1.2MB  │ │ 2.1MB  │        │
│              │  │ ☐      │ │ ☐      │ │ ☐      │ │ ☐      │        │
│  📅 Date     │  └────────┘ └────────┘ └────────┘ └────────┘        │
│  ○ All time  │                                                       │
│  ○ Today     │                                                       │
│  ○ This week │  Showing 1-12 of 156 files        [< 1 2 3 ... 13 >] │
│  ○ Custom    │                                                       │
│              ├──────────────────────────────────────────────────────┤
│  📊 Stats    │  STORAGE: ████████░░ 2.4GB / 5GB                     │
│  156 files   │  By Type: 🖼 89 📄 45 🎬 12 📦 10                     │
│  2.4 GB used │                                                       │
└──────────────┴──────────────────────────────────────────────────────┘
```

### 6.2 File Detail Panel

```
┌─────────────────────────────────────────────────────────────┐
│  city-banner.jpg                                    [✕]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│          ┌─────────────────────────────┐                    │
│          │                             │                    │
│          │       [Image Preview]       │                    │
│          │         1920x1080           │                    │
│          │                             │                    │
│          └─────────────────────────────┘                    │
│                                                             │
│  [📥 Download] [📋 Copy URL] [✏️ Edit] [🗑 Delete]          │
├─────────────────────────────────────────────────────────────┤
│  📋 Details                                                 │
│  ─────────────────────────────────────                      │
│  Display Name:    Smart City Banner                         │
│  Original Name:   city-banner.jpg                           │
│  Type:           image/jpeg                                 │
│  Size:           2.3 MB                                     │
│  Dimensions:     1920 × 1080                                │
│  Bucket:         challenges                                 │
│                                                             │
│  👤 Upload Info                                             │
│  ─────────────────────────────────────                      │
│  Uploaded by:    admin@municipality.gov.sa                  │
│  Upload date:    Dec 10, 2024 at 3:45 PM                    │
│  Age:            2 days ago                                 │
│  Source:         Web Upload                                 │
│                                                             │
│  📊 Analytics                                               │
│  ─────────────────────────────────────                      │
│  Views:          234                                        │
│  Downloads:      12                                         │
│  Last accessed:  Today at 2:30 PM                           │
│                                                             │
│  🔗 Usage (3 places)                                        │
│  ─────────────────────────────────────                      │
│  • Challenge: Smart City Initiative (hero image)            │
│  • Program: Urban Innovation (gallery)                      │
│  • Case Study: Traffic Management (thumbnail)               │
│                                                             │
│  🏷 Tags                                                    │
│  ─────────────────────────────────────                      │
│  [smart-city] [banner] [urban] [+ Add tag]                  │
│                                                             │
│  📝 Description                                             │
│  ─────────────────────────────────────                      │
│  Hero banner for the Smart City Innovation challenge        │
│  showcasing urban technology integration.                   │
│                                                             │
│  Alt Text: Modern smart city skyline with digital overlay   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Upload Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Upload Files                                        [✕]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │     ┌─────┐                                         │   │
│  │     │ 📤  │   Drag & drop files here                │   │
│  │     └─────┘   or click to browse                    │   │
│  │                                                     │   │
│  │     Supports: JPG, PNG, PDF, DOC, MP4 (max 50MB)   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Upload Context                                             │
│  ───────────────                                            │
│  Bucket:      [challenges      ▼]                           │
│  Entity:      [Challenge: Smart City ▼]                     │
│  Category:    [primary         ▼]                           │
│                                                             │
│  Queue (3 files)                                            │
│  ───────────────                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📷 banner.jpg    2.3MB   ████████████░░ 80%   [✕]  │   │
│  │ 📷 photo1.png    1.1MB   ████████████████ Done ✓   │   │
│  │ 📄 report.pdf    450KB   Waiting...             [✕] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancel All]                              [Upload All →]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Workflows

### 7.1 Upload Workflow

```
User initiates upload
        │
        ▼
┌───────────────────┐
│  Select Files     │
│  (drag/browse)    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Validate Files    │──── Invalid ───▶ Show Error
│ (size/type)       │
└────────┬──────────┘
         │ Valid
         ▼
┌───────────────────┐
│ Detect Context    │
│ (entity/bucket)   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Generate Path     │
│ {bucket}/{id}/... │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Upload to Storage │◀─── Retry on failure
│ (Supabase)        │
└────────┬──────────┘
         │ Success
         ▼
┌───────────────────┐
│ Create media_file │
│ record with meta  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Link to Entity    │
│ (if applicable)   │
└────────┬──────────┘
         │
         ▼
    Complete ✓
```

### 7.2 File Deletion Workflow

```
User requests delete
        │
        ▼
┌───────────────────┐
│ Check Usage       │
│ (media_usage)     │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
  Used     Not Used
    │         │
    ▼         ▼
┌───────────┐ ┌───────────┐
│ Warn User │ │ Confirm   │
│ (in use)  │ │ Delete    │
└─────┬─────┘ └─────┬─────┘
      │             │
      ▼             │
 Force delete?      │
      │             │
      └──────┬──────┘
             │ Yes
             ▼
┌───────────────────┐
│ Soft delete       │
│ (set is_deleted)  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Schedule cleanup  │
│ (30 days)         │
└────────┬──────────┘
         │
         ▼
    Deleted ✓
```

---

## 8. API Design

### 8.1 Media Upload API

```typescript
// Upload with automatic metadata population
async function uploadMedia(params: {
  file: File;
  bucket: string;
  entityType?: string;
  entityId?: string;
  category?: 'primary' | 'gallery' | 'document' | 'attachment';
  metadata?: {
    displayName?: string;
    description?: string;
    altText?: string;
    tags?: string[];
  };
}): Promise<MediaFile>
```

### 8.2 Media Query API

```typescript
// Flexible querying
async function queryMedia(params: {
  buckets?: string[];
  entityType?: string;
  entityId?: string;
  mimeTypes?: string[];
  tags?: string[];
  uploadedBy?: string;
  dateRange?: { from: Date; to: Date };
  status?: 'active' | 'archived' | 'pending_deletion';
  search?: string;
  orderBy?: 'created_at' | 'name' | 'size' | 'views';
  orderDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}): Promise<{ files: MediaFile[]; total: number }>
```

---

## 9. Security & Permissions

### 9.1 RLS Policies

```sql
-- Public files viewable by all authenticated users
CREATE POLICY "View public media" ON media_files
  FOR SELECT USING (is_public = true AND is_deleted = false);

-- Users can view their own uploads
CREATE POLICY "View own media" ON media_files
  FOR SELECT USING (uploaded_by_user_id = auth.uid());

-- Municipality staff can view their entity's media
CREATE POLICY "View entity media" ON media_files
  FOR SELECT USING (
    entity_type IS NOT NULL AND
    can_view_entity(auth.uid(), entity_id, NULL)
  );

-- Upload permissions based on role
CREATE POLICY "Upload media" ON media_files
  FOR INSERT WITH CHECK (
    has_permission(auth.uid(), 'media:upload')
  );

-- Delete only own uploads or with admin permission
CREATE POLICY "Delete media" ON media_files
  FOR UPDATE USING (
    uploaded_by_user_id = auth.uid() OR
    has_permission(auth.uid(), 'media:delete_any')
  );
```

### 9.2 Permission Matrix

| Action | Public | Staff | Coordinator | Admin |
|--------|--------|-------|-------------|-------|
| View public files | ✓ | ✓ | ✓ | ✓ |
| View entity files | ✗ | Own entity | Own entity | All |
| Upload files | ✗ | ✓ | ✓ | ✓ |
| Edit own metadata | ✗ | ✓ | ✓ | ✓ |
| Edit any metadata | ✗ | ✗ | ✓ | ✓ |
| Delete own files | ✗ | ✓ | ✓ | ✓ |
| Delete any files | ✗ | ✗ | ✗ | ✓ |
| Bulk operations | ✗ | ✗ | ✓ | ✓ |
| View analytics | ✗ | Own | Entity | All |

---

## 10. Migration Strategy

### Phase 1: Database Setup (Week 1)
1. Create `media_files` table with all columns
2. Create `media_usage` table
3. Create `media_versions` table
4. Create `media_folders` table
5. Set up RLS policies
6. Create indexes for performance

### Phase 2: Storage Buckets (Week 1)
1. Create new feature-specific buckets
2. Configure bucket policies
3. Set up lifecycle rules

### Phase 3: Backfill Existing Files (Week 2)
1. Scan `storage.objects` for existing files
2. Create `media_files` records with available metadata
3. Parse entity references from file paths
4. Mark as `upload_source: 'migration'`

### Phase 4: Update Upload Components (Week 2-3)
1. Create `UnifiedMediaUploader` component
2. Replace existing uploaders gradually
3. Ensure backward compatibility

### Phase 5: Enhanced Media Library (Week 3-4)
1. Build new MediaLibrary components
2. Add filtering, search, analytics
3. Implement bulk operations
4. Add usage tracking

### Phase 6: Entity Integration (Week 4+)
1. Update entity forms to use MediaPicker
2. Populate `media_usage` on entity save
3. Add media sections to entity detail pages

---

## 11. Performance Considerations

### 11.1 Indexing Strategy

```sql
-- Primary lookup indexes
CREATE INDEX idx_media_files_bucket ON media_files(bucket_id);
CREATE INDEX idx_media_files_entity ON media_files(entity_type, entity_id);
CREATE INDEX idx_media_files_uploader ON media_files(uploaded_by_user_id);
CREATE INDEX idx_media_files_status ON media_files(status, is_deleted);

-- Search indexes
CREATE INDEX idx_media_files_tags ON media_files USING GIN(tags);
CREATE INDEX idx_media_files_search ON media_files 
  USING GIN(to_tsvector('english', display_name || ' ' || COALESCE(description, '')));

-- Analytics indexes
CREATE INDEX idx_media_files_created ON media_files(created_at DESC);
CREATE INDEX idx_media_files_accessed ON media_files(last_accessed_at DESC);
```

### 11.2 Caching Strategy
- Cache bucket file counts (5 min TTL)
- Cache storage usage stats (15 min TTL)
- Lazy load file previews
- Paginate large lists (50 files per page)

---

## 12. Future Enhancements

### Phase 2 Features
- AI-powered auto-tagging and description
- Image transformation API (resize, crop, watermark)
- Video transcoding and thumbnails
- OCR for document search
- Duplicate detection

### Phase 3 Features
- Collaborative folders and sharing
- Version comparison view
- Bulk metadata editing
- Scheduled cleanup jobs
- Advanced analytics dashboard

---

## 13. Success Metrics

| Metric | Target |
|--------|--------|
| Upload success rate | > 99% |
| Metadata completion | > 90% |
| Orphan file rate | < 5% |
| Average load time | < 2s |
| Storage utilization | < 80% |
| User adoption | > 80% of staff |

---

*Document Version: 1.0*
*Last Updated: December 12, 2024*
