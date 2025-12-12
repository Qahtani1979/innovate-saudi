/* @refresh reset */
/* Cache bust: v3 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { STORAGE_BUCKETS, formatFileSize, getFileType, getMimeCategory } from '@/config/mediaConfig';

// Re-export for backward compatibility
export { STORAGE_BUCKETS, formatFileSize, getFileType };

const PAGE_SIZE = 50;

export function useMediaLibrary(options = {}) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((text) => typeof text === 'string' ? text : text?.en || '');
  
  const [dbMediaFiles, setDbMediaFiles] = useState([]);
  const [storageFiles, setStorageFiles] = useState([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedBuckets, setSelectedBuckets] = useState(options.defaultBuckets || ['uploads', 'challenges', 'solutions', 'pilots', 'programs']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Fetch media files from database
  const fetchDbFiles = useCallback(async () => {
    setIsLoadingDb(true);
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching media files from DB:', error);
        setDbMediaFiles([]);
      } else {
        setDbMediaFiles(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch DB files:', err);
      setDbMediaFiles([]);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  // Fetch files from storage buckets
  const fetchStorageFiles = useCallback(async () => {
    setIsLoadingStorage(true);
    try {
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

      setStorageFiles(allFiles);
    } catch (err) {
      console.error('Failed to fetch storage files:', err);
      setStorageFiles([]);
    } finally {
      setIsLoadingStorage(false);
    }
  }, [selectedBuckets]);

  // Initial load
  useEffect(() => {
    fetchDbFiles();
  }, [fetchDbFiles]);

  useEffect(() => {
    fetchStorageFiles();
  }, [fetchStorageFiles]);

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

  // Paginated media
  const paginatedMedia = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredMedia.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredMedia, page]);

  const totalPages = Math.ceil(filteredMedia.length / PAGE_SIZE);

  // Reset page when filters change
  const handleFilterChange = useCallback((setter) => (value) => {
    setPage(1);
    setter(value);
  }, []);

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

  // Upload function
  const upload = useCallback(async ({ file, bucket, entityType, entityId, category, metadata = {} }) => {
    setIsUploading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;
      
      let storagePath = fileName;
      if (entityId) {
        storagePath = `${entityId}/${category || 'attachments'}/${fileName}`;
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      let publicUrl = '';
      if (STORAGE_BUCKETS[bucket]?.public) {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(storagePath);
        publicUrl = urlData?.publicUrl || '';
      }

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
      }

      toast.success(t({ en: 'File uploaded successfully', ar: 'تم رفع الملف بنجاح' }));
      fetchDbFiles();
      fetchStorageFiles();
      return { uploadData, mediaRecord, publicUrl };
    } catch (error) {
      toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [t, fetchDbFiles, fetchStorageFiles]);

  // Delete function
  const deleteFile = useCallback(async ({ id, bucketId, storagePath, source }) => {
    setIsDeleting(true);
    try {
      const { error: storageError } = await supabase.storage
        .from(bucketId)
        .remove([storagePath]);

      if (storageError) {
        console.warn('Storage delete error:', storageError);
      }

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

      toast.success(t({ en: 'File deleted', ar: 'تم حذف الملف' }));
      fetchDbFiles();
      fetchStorageFiles();
      return { success: true };
    } catch (error) {
      toast.error(t({ en: 'Delete failed', ar: 'فشل الحذف' }));
      console.error('Delete error:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [t, fetchDbFiles, fetchStorageFiles]);

  // Update metadata function
  const updateMetadata = useCallback(async ({ id, updates }) => {
    setIsUpdating(true);
    try {
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
      
      toast.success(t({ en: 'File updated', ar: 'تم تحديث الملف' }));
      fetchDbFiles();
      return data;
    } catch (error) {
      toast.error(t({ en: 'Update failed', ar: 'فشل التحديث' }));
      console.error('Update error:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [t, fetchDbFiles]);

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
    media: paginatedMedia,
    allMedia: filteredMedia,
    totalMedia: filteredMedia.length,
    stats,
    
    // Pagination
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    
    // Loading states
    isLoading: isLoadingDb || isLoadingStorage,
    
    // Filters (with auto page reset)
    selectedBuckets,
    setSelectedBuckets: handleFilterChange(setSelectedBuckets),
    searchTerm,
    setSearchTerm: handleFilterChange(setSearchTerm),
    selectedType,
    setSelectedType: handleFilterChange(setSelectedType),
    sortBy,
    setSortBy: handleFilterChange(setSortBy),
    sortOrder,
    setSortOrder,
    
    // Actions
    upload,
    isUploading,
    delete: deleteFile,
    isDeleting,
    updateMetadata,
    isUpdating,
    trackView,
    trackDownload,
    
    // Utilities
    formatFileSize,
    getFileType,
    refetch: () => {
      fetchDbFiles();
      fetchStorageFiles();
    }
  };
}
