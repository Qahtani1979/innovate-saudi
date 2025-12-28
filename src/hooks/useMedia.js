import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useMediaLibrary({ typeFilter = 'all', searchQuery = '', bucketId = '', allowedTypes = [] } = {}) {
    return useQuery({
        queryKey: ['media-library', typeFilter, searchQuery, bucketId, allowedTypes],
        queryFn: async () => {
            let query = supabase
                .from('media_files')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
                .limit(50);

            if (bucketId) {
                query = query.eq('bucket_id', bucketId);
            }

            if (typeFilter !== 'all') {
                query = query.eq('file_type', typeFilter);
            }

            if (searchQuery) {
                query = query.or(`original_filename.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
            }

            // Filter by allowed types if 'all' is selected but specific types are allowed
            if (allowedTypes && allowedTypes.length > 0 && typeFilter === 'all') {
                query = query.in('file_type', allowedTypes);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

