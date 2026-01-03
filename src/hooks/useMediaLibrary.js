import { useState, useMemo } from 'react';
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

    // State for filtering and pagination
    const [selectedBuckets, setSelectedBuckets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const pageSize = 50;

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

    const allMedia = mediaQuery.data || [];

    // Compute filtered and paginated media
    const filteredMedia = useMemo(() => {
        let result = [...allMedia];

        // Filter by bucket
        if (selectedBuckets.length > 0) {
            result = result.filter(f => f.bucket_id && selectedBuckets.includes(f.bucket_id));
        }

        // Filter by type
        if (selectedType !== 'all') {
            result = result.filter(f => f.file_type === selectedType || (f.mime_type && f.mime_type.startsWith(selectedType)));
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(f =>
                (f.original_filename && f.original_filename.toLowerCase().includes(term)) ||
                (f.display_name && f.display_name.toLowerCase().includes(term))
            );
        }

        // Sort
        result.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [allMedia, selectedBuckets, selectedType, searchTerm, sortBy, sortOrder]);

    const totalMedia = filteredMedia.length;
    const totalPages = Math.ceil(totalMedia / pageSize);
    const paginatedMedia = filteredMedia.slice((page - 1) * pageSize, page * pageSize);

    // Compute stats
    const stats = useMemo(() => {
        const byType = {};
        const byBucket = {};
        let totalSize = 0;

        allMedia.forEach(f => {
            const type = f.file_type || 'other';
            byType[type] = (byType[type] || 0) + 1;
            const bucket = f.bucket_id || 'unknown';
            byBucket[bucket] = (byBucket[bucket] || 0) + 1;
            totalSize += f.file_size || 0;
        });

        return { byType, byBucket, totalSize, totalFiles: allMedia.length };
    }, [allMedia]);

    // Format file size helper
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    // Track download
    const trackDownload = async (id) => {
        try {
            await supabase.rpc('increment_download_count', { file_id: id });
        } catch (e) {
            // Silent fail for tracking
        }
    };

    // Update metadata
    const updateMetadata = useMutation({
        mutationFn: async ({ id, metadata }) => {
            const { error } = await supabase
                .from('media_registry')
                .update(metadata)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['media-library']);
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
        media: paginatedMedia,
        allMedia,
        totalMedia,
        stats,
        isLoading: mediaQuery.isLoading,
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
        page,
        setPage,
        totalPages,
        pageSize,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        upload,
        isUploading: upload.isPending,
        delete: deleteFile,
        updateMetadata,
        isUpdating: updateMetadata.isPending,
        trackDownload,
        refetch: mediaQuery.refetch,
        formatFileSize,
    };
}



