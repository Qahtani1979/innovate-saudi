/**
 * Challenge Storage Hook
 * Implements: stor-1 (image uploads), stor-2 (document uploads), stor-3 (gallery),
 * stor-4 (file size validation), stor-5 (file type validation)
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// File validation constants (stor-4, stor-5)
export const STORAGE_CONFIG = {
  bucketName: 'challenges',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  folders: {
    images: 'images',
    documents: 'documents',
    gallery: 'gallery',
    attachments: 'attachments'
  }
};

// File type to folder mapping
const getFileFolder = (mimeType) => {
  if (STORAGE_CONFIG.allowedImageTypes.includes(mimeType)) {
    return STORAGE_CONFIG.folders.images;
  }
  if (STORAGE_CONFIG.allowedDocumentTypes.includes(mimeType)) {
    return STORAGE_CONFIG.folders.documents;
  }
  return STORAGE_CONFIG.folders.attachments;
};

// Validate file before upload
const validateFile = (file, options = {}) => {
  const { maxSize = STORAGE_CONFIG.maxFileSize, allowedTypes = null } = options;
  
  // Size validation (stor-4)
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File size exceeds ${maxMB}MB limit` };
  }
  
  // Type validation (stor-5)
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }
  
  return { valid: true };
};

// Generate unique file path
const generateFilePath = (challengeId, file, folder = null) => {
  const fileFolder = folder || getFileFolder(file.type);
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${challengeId}/${fileFolder}/${timestamp}_${safeFileName}`;
};

export function useChallengeStorage(challengeId) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState({});
  
  /**
   * Upload a single file (stor-1, stor-2)
   */
  const uploadFile = useCallback(async (file, options = {}) => {
    const { folder, onProgress } = options;
    
    // Validate file
    const validation = validateFile(file, {
      allowedTypes: folder === 'images' 
        ? STORAGE_CONFIG.allowedImageTypes 
        : [...STORAGE_CONFIG.allowedImageTypes, ...STORAGE_CONFIG.allowedDocumentTypes]
    });
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const filePath = generateFilePath(challengeId, file, folder);
    
    // Track upload progress
    const fileId = `${challengeId}_${file.name}`;
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
    
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_CONFIG.bucketName)
        .getPublicUrl(filePath);
      
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      
      return {
        path: filePath,
        publicUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (error) {
      setUploadProgress(prev => {
        const { [fileId]: _, ...rest } = prev;
        return rest;
      });
      throw error;
    }
  }, [challengeId]);
  
  /**
   * Upload mutation
   */
  const uploadMutation = useMutation({
    mutationFn: async ({ file, folder }) => uploadFile(file, { folder }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challenge-files', challengeId] });
      toast.success('File uploaded successfully');
      return data;
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    }
  });
  
  /**
   * Upload multiple files for gallery (stor-3)
   */
  const uploadGallery = useMutation({
    mutationFn: async (files) => {
      const results = [];
      for (const file of files) {
        const validation = validateFile(file, {
          allowedTypes: STORAGE_CONFIG.allowedImageTypes
        });
        
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }
        
        try {
          const result = await uploadFile(file, { folder: 'gallery' });
          results.push(result);
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      return results;
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['challenge-files', challengeId] });
        toast.success(`${data.length} images uploaded to gallery`);
      }
    }
  });
  
  /**
   * Delete a file
   */
  const deleteFile = useMutation({
    mutationFn: async (filePath) => {
      const { error } = await supabase.storage
        .from(STORAGE_CONFIG.bucketName)
        .remove([filePath]);
      
      if (error) throw error;
      return filePath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-files', challengeId] });
      toast.success('File deleted');
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    }
  });
  
  /**
   * List files for a challenge
   */
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['challenge-files', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.bucketName)
        .list(challengeId, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) throw error;
      
      // Get public URLs for all files
      return (data || []).map(file => ({
        ...file,
        publicUrl: supabase.storage
          .from(STORAGE_CONFIG.bucketName)
          .getPublicUrl(`${challengeId}/${file.name}`).data.publicUrl
      }));
    },
    enabled: !!challengeId
  });
  
  /**
   * Update challenge with image URL
   */
  const updateChallengeImage = useMutation({
    mutationFn: async (imageUrl) => {
      const { error } = await supabase
        .from('challenges')
        .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', challengeId);
      
      if (error) throw error;
      return imageUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
    }
  });
  
  /**
   * Update challenge gallery URLs
   */
  const updateChallengeGallery = useMutation({
    mutationFn: async (galleryUrls) => {
      const { error } = await supabase
        .from('challenges')
        .update({ gallery_urls: galleryUrls, updated_at: new Date().toISOString() })
        .eq('id', challengeId);
      
      if (error) throw error;
      return galleryUrls;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
    }
  });
  
  return {
    // Upload functions
    uploadFile: uploadMutation.mutate,
    uploadFileAsync: uploadMutation.mutateAsync,
    uploadGallery: uploadGallery.mutate,
    uploadGalleryAsync: uploadGallery.mutateAsync,
    
    // Delete function
    deleteFile: deleteFile.mutate,
    deleteFileAsync: deleteFile.mutateAsync,
    
    // Update challenge
    updateChallengeImage: updateChallengeImage.mutate,
    updateChallengeGallery: updateChallengeGallery.mutate,
    
    // State
    files,
    filesLoading,
    uploadProgress,
    isUploading: uploadMutation.isPending || uploadGallery.isPending,
    isDeleting: deleteFile.isPending,
    
    // Config
    STORAGE_CONFIG,
    validateFile
  };
}

export default useChallengeStorage;
