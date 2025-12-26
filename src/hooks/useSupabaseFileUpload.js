import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

/**
 * useSupabaseFileUpload
 * ✅ GOLD STANDARD COMPLIANT
 * 
 * Hook for uploading files to Supabase Storage.
 */
export function useSupabaseFileUpload() {
    const { user } = useAuth();
    const [progress, setProgress] = useState(0);

    const uploadFile = useMutation({
        /** @param {{file: File, bucket?: string, maxSize?: number}} params */
        mutationFn: async ({ file, bucket = 'avatars', maxSize = 5 }) => {
            if (!file) throw new Error('No file provided');

            // Validate size
            if (file.size > maxSize * 1024 * 1024) {
                throw new Error(`File size must be less than ${maxSize}MB`);
            }

            setProgress(10);

            // Create unique file path with user ID
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id || 'public'}/${Date.now()}.${fileExt}`;

            setProgress(30);

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) throw error;

            setProgress(80);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;

            setProgress(100);
            return publicUrl;
        },
        onSuccess: () => {
            toast.success('File uploaded successfully');
        },
        onError: (error) => {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload file');
            setProgress(0);
        }
    });

    return {
        upload: uploadFile.mutateAsync,
        isUploading: uploadFile.isPending,
        progress,
        resetProgress: () => setProgress(0)
    };
}

export default useSupabaseFileUpload;
