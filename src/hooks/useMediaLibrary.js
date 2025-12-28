import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { useFileStorage } from './usePlatformCore';

/**
 * Hook for media library operations
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useMediaLibrary() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const { uploadMutation, deleteMutation } = useFileStorage();

    // Fetch all media from the database registry
    const mediaQuery = useQuery({
        queryKey: ['media-library'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('media_registry')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });

    // Integrated Upload mutation
    const upload = useMutation({
        mutationFn: async ({ file, bucket = 'uploads', folder = '' }) => {
            // 1. Upload to storage
            const uploadResult = await uploadMutation.mutateAsync({ file, bucket, folder });

            // 2. Register in database
            const { data, error } = await supabase
                .from('media_registry')
                .insert({
                    original_filename: file.name,
                    display_name: file.name,
                    file_path: uploadResult.file_path,
                    file_size: file.size,
                    mime_type: file.type,
                    bucket_id: bucket,
                    public_url: uploadResult.file_url,
                    uploaded_by: user?.id,
                    uploaded_by_email: user?.email,
                    metadata: {
                        source: 'media_library',
                        folder: folder
                    }
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['media-library']);
            toast.success(t({ en: 'File uploaded successfully', ar: 'تم رفع الملف بنجاح' }));
        },
        onError: (error) => {
            console.error('Upload error:', error);
            toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
        }
    });

    // Integrated Delete mutation
    const deleteFile = useMutation({
        mutationFn: async ({ id, bucketId, storagePath }) => {
            // 1. Delete from storage
            await deleteMutation.mutateAsync({ path: storagePath, bucket: bucketId });

            // 2. Delete from database registry
            const { error } = await supabase
                .from('media_registry')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['media-library']);
            toast.success(t({ en: 'File deleted successfully', ar: 'تم حذف الملف بنجاح' }));
        },
        onError: (error) => {
            console.error('Delete error:', error);
            toast.error(t({ en: 'Delete failed', ar: 'فشل الحذف' }));
        }
    });

    return {
        media: mediaQuery.data || [],
        isLoading: mediaQuery.isLoading,
        upload,
        delete: deleteFile,
        isUploading: upload.isPending,
        isDeleting: deleteFile.isPending,
        refetch: mediaQuery.refetch
    };
}



