import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMediaDependencies } from './useMediaDependencies';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for integrating media management with entities like Programs and Events.
 * Handles registration of media usage, tracking, and cleanup.
 */
export function useMediaIntegration(entityType, entityId) {
  const { user } = useAuth();
  const { registerUsage, removeUsage, getEntityMediaUsages } = useMediaDependencies();

  /**
   * Register media file usage when selecting from library
   */
  const registerMediaFromLibrary = useCallback(async (mediaFile, fieldName, isPrimary = false) => {
    if (!mediaFile?.id || !entityId) {
      console.warn('Missing mediaFile or entityId for registration');
      return { success: false, error: 'Missing parameters' };
    }

    return registerUsage({
      mediaFileId: mediaFile.id,
      entityType,
      entityId,
      fieldName,
      usageType: 'reference',
      isPrimary,
    });
  }, [entityType, entityId, registerUsage]);

  /**
   * Register media file after upload - creates entry in media_files and registers usage
   */
  const registerUploadedMedia = useCallback(async (publicUrl, fieldName, metadata = {}) => {
    if (!publicUrl || !entityId) {
      console.warn('Missing publicUrl or entityId for registration');
      return { success: false, url: publicUrl };
    }

    try {
      // Extract filename from URL
      const urlParts = publicUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const extension = filename.split('.').pop()?.toLowerCase() || '';
      
      // Determine file type
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const videoExtensions = ['mp4', 'webm', 'mov', 'avi'];
      const audioExtensions = ['mp3', 'wav', 'm4a', 'ogg'];
      
      let fileType = 'other';
      if (imageExtensions.includes(extension)) fileType = 'image';
      else if (videoExtensions.includes(extension)) fileType = 'video';
      else if (audioExtensions.includes(extension)) fileType = 'audio';
      else if (extension === 'pdf') fileType = 'pdf';
      else if (['doc', 'docx'].includes(extension)) fileType = 'document';

      // Determine bucket from URL
      const bucketMatch = publicUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\//);
      const bucketId = bucketMatch ? bucketMatch[1] : entityType;

      // Create media_files entry
      const { data: mediaFile, error: insertError } = await supabase
        .from('media_files')
        .insert({
          bucket_id: bucketId,
          storage_path: filename,
          public_url: publicUrl,
          original_filename: filename,
          display_name: metadata.displayName || filename,
          file_type: fileType,
          file_extension: extension,
          mime_type: metadata.mimeType || `${fileType}/${extension}`,
          uploaded_by_email: user?.email,
          uploaded_by_user_id: user?.id,
          upload_source: 'entity_form',
          entity_type: entityType,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating media file entry:', insertError);
        // Still return success with just the URL if media_files insert fails
        return { success: true, url: publicUrl, mediaFileId: null };
      }

      // Register usage
      await registerUsage({
        mediaFileId: mediaFile.id,
        entityType,
        entityId,
        fieldName,
        usageType: 'reference',
        isPrimary: fieldName === 'image_url',
      });

      return { 
        success: true, 
        url: publicUrl, 
        mediaFileId: mediaFile.id,
        mediaFile 
      };
    } catch (error) {
      console.error('Error in registerUploadedMedia:', error);
      return { success: true, url: publicUrl, mediaFileId: null };
    }
  }, [entityType, entityId, user, registerUsage]);

  /**
   * Handle media selection from MediaLibraryPicker
   */
  const handleMediaSelect = useCallback(async (result, fieldName) => {
    if (result.type === 'library' && result.file) {
      // Selected from library - register usage
      await registerMediaFromLibrary(result.file, fieldName, fieldName === 'image_url');
      return result.file.public_url;
    } else if (result.type === 'upload' && result.url) {
      // New upload - create media file and register
      const uploadResult = await registerUploadedMedia(result.url, fieldName);
      return uploadResult.url;
    }
    return null;
  }, [registerMediaFromLibrary, registerUploadedMedia]);

  /**
   * Remove media usage when field is cleared
   */
  const removeMediaUsage = useCallback(async (mediaFileId, fieldName) => {
    if (!mediaFileId || !entityId) return { success: false };
    
    return removeUsage({
      mediaFileId,
      entityType,
      entityId,
      fieldName,
    });
  }, [entityType, entityId, removeUsage]);

  /**
   * Get all media usages for this entity
   */
  const getMediaUsages = useCallback(async () => {
    if (!entityId) return { success: false, data: [] };
    return getEntityMediaUsages(entityType, entityId);
  }, [entityType, entityId, getEntityMediaUsages]);

  return {
    registerMediaFromLibrary,
    registerUploadedMedia,
    handleMediaSelect,
    removeMediaUsage,
    getMediaUsages,
  };
}

export default useMediaIntegration;
