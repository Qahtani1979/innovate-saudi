import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch matchmaker alumni (providers with completed partnerships)
 */
export function useMatchmakerAlumni() {
    return useQuery({
        queryKey: ['matchmaker-alumni'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organization_partnerships')
                .select(`
                    provider_id,
                    provider:organizations!provider_id(name_en, name_ar, logo_url, website)
                `)
                .eq('status', 'completed');

            if (error) throw error;

            // Deduplicate providers
            const uniqueDetails = new Map();
            data?.forEach(item => {
                if (item.provider && !uniqueDetails.has(item.provider_id)) {
                    uniqueDetails.set(item.provider_id, item.provider);
                }
            });

            return Array.from(uniqueDetails.values());
        }
    });
}
