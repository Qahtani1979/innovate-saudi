import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

/**
 * Hook suite for core platform infrastructure services.
 */

/**
 * useFileStorage: Standardized hook for file uploads and management.
 */
export function useFileStorage() {
    const { user } = useAuth();
    const queryClient = useAppQueryClient();

    const uploadMutation = useMutation({
        /** @param {{file: File, bucket?: string, folder?: string, maxSize?: number, allowedTypes?: string[]}} args */
        mutationFn: async ({ file, bucket = 'uploads', folder = '', maxSize = 50, allowedTypes = [] }) => {
            if (!file) throw new Error('No file provided');

            // Size validation (default 50MB)
            if (file.size > maxSize * 1024 * 1024) {
                throw new Error(`File size must be less than ${maxSize}MB`);
            }

            // Type validation
            if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
                throw new Error(`File type ${file.type} is not allowed`);
            }

            const fileExt = file.name.split('.').pop();
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(7);
            const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

            // Path structure: [user_id]/[folder]/[timestamp]_[random]_[name].[ext]
            const baseDir = user?.id || 'public';
            const subDir = folder ? `/${folder}` : '';
            const fileName = `${baseDir}${subDir}/${timestamp}_${randomId}_${safeFileName}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            return {
                file_url: urlData.publicUrl,
                file_path: fileName,
                file_name: file.name,
                file_size: file.size,
                mime_type: file.type,
                bucket
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['media-library'] });
            queryClient.invalidateQueries({ queryKey: ['entity-attachments'] });
        }
    });

    const deleteMutation = useMutation({
        /** @param {{path: string, bucket: string}} args */
        mutationFn: async ({ path, bucket }) => {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) throw error;
            return path;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media-library'] });
            queryClient.invalidateQueries({ queryKey: ['entity-attachments'] });
        }
    });

    return {
        uploadMutation,
        deleteMutation,
        uploading: uploadMutation.isPending,
        deleting: deleteMutation.isPending,
        error: uploadMutation.error || deleteMutation.error
    };
}

/**
 * useImageSearch: Web search for free-to-use images.
 */
export function useImageSearch() {
    const searchMutation = useMutation({
        /** @param {{query: string, page?: number}} args */
        mutationFn: async ({ query, page = 1 }) => {
            const { data, error } = await supabase.functions.invoke('searchImages', {
                body: { searchQuery: query, page }
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error || 'Search failed');

            return data.images || [];
        }
    });

    return {
        searchMutation,
        searching: searchMutation.isPending,
        error: searchMutation.error
    };
}

/**
 * useEmbeddingManager: Manages vector embedding generation.
 */
export function useEmbeddingManager() {
    const embedMutation = useMutation({
        /** @param {{entityName: string, mode?: string}} args */
        mutationFn: async ({ entityName, mode = 'missing' }) => {
            const { data, error } = await supabase.functions.invoke('generateEmbeddings', {
                body: { entity_name: entityName, mode }
            });

            if (error) throw error;
            return data;
        }
    });

    return {
        embedMutation,
        generating: embedMutation.isPending,
        error: embedMutation.error
    };
}

/**
 * useSemanticSearch: Intelligent semantic search across entities.
 */
export function useSemanticSearch() {
    const searchMutation = useMutation({
        /** @param {{query: string, entityName: string, limit?: number, threshold?: number}} args */
        mutationFn: async ({ query, entityName, limit = 10, threshold = 0.6 }) => {
            const { data, error } = await supabase.functions.invoke('semanticSearch', {
                body: { query, entity_name: entityName, limit, threshold }
            });

            if (error) throw error;
            return data;
        }
    });

    return {
        searchMutation,
        searching: searchMutation.isPending,
        error: searchMutation.error
    };
}



