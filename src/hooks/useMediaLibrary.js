import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

// Bucket configuration
export const STORAGE_BUCKETS = {
  uploads: { label: { en: 'General Uploads', ar: 'الرفعات العامة' }, public: true },
  challenges: { label: { en: 'Challenges', ar: 'التحديات' }, public: true },
  solutions: { label: { en: 'Solutions', ar: 'الحلول' }, public: true },
  pilots: { label: { en: 'Pilots', ar: 'المشاريع التجريبية' }, public: true },
  programs: { label: { en: 'Programs', ar: 'البرامج' }, public: true },
  'rd-projects': { label: { en: 'R&D Projects', ar: 'مشاريع البحث والتطوير' }, public: true },
  organizations: { label: { en: 'Organizations', ar: 'المنظمات' }, public: true },
  knowledge: { label: { en: 'Knowledge Base', ar: 'قاعدة المعرفة' }, public: true },
  events: { label: { en: 'Events', ar: 'الفعاليات' }, public: true },
  avatars: { label: { en: 'Avatars', ar: 'الصور الشخصية' }, public: true },
  'cv-uploads': { label: { en: 'CVs & Resumes', ar: 'السير الذاتية' }, public: false },
  temp: { label: { en: 'Temporary', ar: 'مؤقت' }, public: false },
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileType = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) return 'audio';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext)) return 'document';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'spreadsheet';
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'presentation';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
  return 'other';
};

const getMimeCategory = (mimeType) => {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  return 'other';
};

export function useMediaLibrary(options = {}) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedBuckets, setSelectedBuckets] = useState(options.defaultBuckets || ['uploads', 'challenges', 'solutions', 'pilots', 'programs']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch media files from database (media_files table)
  const { data: dbMediaFiles = [], isLoading: isLoadingDb } = useQuery({
    queryKey: ['media-files-db'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching media files from DB:', error);
        return [];
      }
      return data || [];
    }
  });

  // Fetch files from storage buckets directly (for legacy/untracked files)
  const { data: storageFiles = [], isLoading: isLoadingStorage } = useQuery({
    queryKey: ['media-library-storage', selectedBuckets],
    queryFn: async () => {
      const allFiles = [];

      for (const bucketId of selectedBuckets) {
        try {
          const { data: bucketFiles, error } = await supabase.storage
            .from(bucketId)
            .list('', {
              limit: 200,
              sortBy: { column: 'created_at', order: 'desc' }
            });

          if (error) {
            console.warn(`Error fetching from bucket ${bucketId}:`, error);
            continue;
          }

          // Also fetch from public folder if exists
          const { data: publicFiles } = await supabase.storage
            .from(bucketId)
            .list('public', {
              limit: 200,
              sortBy: { column: 'created_at', order: 'desc' }
            });

          const processFiles = (files, prefix = '') => {
            return files
              ?.filter(f => f.name && !f.name.startsWith('.'))
              .map(file => {
                const path = prefix ? `${prefix}/${file.name}` : file.name;
                const isPublic = STORAGE_BUCKETS[bucketId]?.public ?? true;
                
                let url = '';
                if (isPublic) {
                  const { data: urlData } = supabase.storage
                    .from(bucketId)
                    .getPublicUrl(path);
                  url = urlData?.publicUrl || '';
                }

                return {
                  id: file.id || `${bucketId}-${path}`,
                  bucket_id: bucketId,
                  storage_path: path,
                  public_url: url,
                  original_filename: file.name,
                  display_name: file.name,
                  mime_type: file.metadata?.mimetype,
                  file_size: file.metadata?.size || 0,
                  file_extension: file.name.split('.').pop()?.toLowerCase(),
                  file_type: getMimeCategory(file.metadata?.mimetype) || getFileType(file.name),
                  created_at: file.created_at,
                  updated_at: file.updated_at,
                  last_accessed_at: file.last_accessed_at,
                  owner_id: file.owner,
                  is_public: isPublic,
                  source: 'storage'
                };
              }) || [];
          };

          allFiles.push(...processFiles(bucketFiles));
          if (publicFiles) {
            allFiles.push(...processFiles(publicFiles, 'public'));
          }
        } catch (err) {
          console.warn(`Failed to fetch from bucket ${bucketId}:`, err);
        }
      }

      return allFiles;
    },
    staleTime: 30000
  });

  // Merge database and storage files
  const allMedia = useMemo(() => {
    const dbPaths = new Set(dbMediaFiles.map(f => `${f.bucket_id}/${f.storage_path}`));
    
    // Add storage files that aren't tracked in DB
    const untracked = storageFiles.filter(f => 
      !dbPaths.has(`${f.bucket_id}/${f.storage_path}`)
    );

    const dbWithType = dbMediaFiles.map(f => ({
      ...f,
      file_type: getMimeCategory(f.mime_type) || getFileType(f.original_filename),
      source: 'database'
    }));

    return [...dbWithType, ...untracked];
  }, [dbMediaFiles, storageFiles]);

  // Filter and sort
  const filteredMedia = useMemo(() => {
    let result = allMedia;

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter(f => f.file_type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(f => 
        f.original_filename?.toLowerCase().includes(term) ||
        f.display_name?.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term) ||
        f.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filter by selected buckets
    result = result.filter(f => selectedBuckets.includes(f.bucket_id));

    // Sort
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (sortBy === 'file_size') {
        valA = valA || 0;
        valB = valB || 0;
      } else if (sortBy === 'created_at' || sortBy === 'last_accessed_at') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    return result;
  }, [allMedia, selectedType, searchTerm, selectedBuckets, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const byType = {
      all: allMedia.length,
      image: allMedia.filter(f => f.file_type === 'image').length,
      video: allMedia.filter(f => f.file_type === 'video').length,
      document: allMedia.filter(f => ['document', 'pdf', 'spreadsheet', 'presentation'].includes(f.file_type)).length,
      other: allMedia.filter(f => ['audio', 'archive', 'other'].includes(f.file_type)).length,
    };

    const byBucket = {};
    selectedBuckets.forEach(bucket => {
      byBucket[bucket] = allMedia.filter(f => f.bucket_id === bucket).length;
    });

    const totalSize = allMedia.reduce((sum, f) => sum + (f.file_size || 0), 0);

    return {
      byType,
      byBucket,
      totalFiles: allMedia.length,
      totalSize,
      totalSizeFormatted: formatFileSize(totalSize)
    };
  }, [allMedia, selectedBuckets]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, bucket, entityType, entityId, category, metadata = {} }) => {
      const user = (await supabase.auth.getUser()).data.user;
      
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;
      
      // Build storage path
      let storagePath = fileName;
      if (entityId) {
        storagePath = `${entityId}/${category || 'attachments'}/${fileName}`;
      }

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      let publicUrl = '';
      if (STORAGE_BUCKETS[bucket]?.public) {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(storagePath);
        publicUrl = urlData?.publicUrl || '';
      }

      // Create media_files record
      const { data: mediaRecord, error: dbError } = await supabase
        .from('media_files')
        .insert({
          bucket_id: bucket,
          storage_path: storagePath,
          public_url: publicUrl,
          original_filename: file.name,
          display_name: metadata.displayName || file.name,
          description: metadata.description,
          alt_text: metadata.altText,
          mime_type: file.type,
          file_size: file.size,
          file_extension: fileExt?.toLowerCase(),
          uploaded_by_user_id: user?.id,
          uploaded_by_email: user?.email,
          upload_source: 'web',
          entity_type: entityType,
          entity_id: entityId,
          category: category,
          tags: metadata.tags || [],
          is_public: STORAGE_BUCKETS[bucket]?.public ?? true
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error creating media record:', dbError);
        // Still return success since file was uploaded
      }

      return { uploadData, mediaRecord, publicUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media-files-db']);
      queryClient.invalidateQueries(['media-library-storage']);
      toast.success(t({ en: 'File uploaded successfully', ar: 'تم رفع الملف بنجاح' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
      console.error('Upload error:', error);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, bucketId, storagePath, source }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketId)
        .remove([storagePath]);

      if (storageError) {
        console.warn('Storage delete error:', storageError);
      }

      // Soft delete from database if tracked
      if (source === 'database' && id) {
        const user = (await supabase.auth.getUser()).data.user;
        const { error: dbError } = await supabase
          .from('media_files')
          .update({
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            deleted_by: user?.email
          })
          .eq('id', id);

        if (dbError) {
          console.error('DB delete error:', dbError);
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media-files-db']);
      queryClient.invalidateQueries(['media-library-storage']);
      toast.success(t({ en: 'File deleted', ar: 'تم حذف الملف' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Delete failed', ar: 'فشل الحذف' }));
      console.error('Delete error:', error);
    }
  });

  // Update metadata mutation
  const updateMetadataMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('media_files')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media-files-db']);
      toast.success(t({ en: 'File updated', ar: 'تم تحديث الملف' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Update failed', ar: 'فشل التحديث' }));
      console.error('Update error:', error);
    }
  });

  // Track view
  const trackView = useCallback(async (mediaId) => {
    if (!mediaId) return;
    try {
      await supabase.rpc('increment_media_view', { p_media_id: mediaId });
    } catch (err) {
      console.warn('Failed to track view:', err);
    }
  }, []);

  // Track download
  const trackDownload = useCallback(async (mediaId) => {
    if (!mediaId) return;
    try {
      await supabase.rpc('increment_media_download', { p_media_id: mediaId });
    } catch (err) {
      console.warn('Failed to track download:', err);
    }
  }, []);

  return {
    // Data
    media: filteredMedia,
    allMedia,
    stats,
    
    // Loading states
    isLoading: isLoadingDb || isLoadingStorage,
    
    // Filters
    selectedBuckets,
    setSelectedBuckets,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    
    // Actions
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    updateMetadata: updateMetadataMutation.mutate,
    isUpdating: updateMetadataMutation.isPending,
    trackView,
    trackDownload,
    
    // Utilities
    formatFileSize,
    getFileType,
    refetch: () => {
      queryClient.invalidateQueries(['media-files-db']);
      queryClient.invalidateQueries(['media-library-storage']);
    }
  };
}
