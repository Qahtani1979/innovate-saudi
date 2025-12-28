import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch recipients based on type and segment
 */
export function useRecipientSelection(recipientType, audienceSegment) {

    // Fetch available recipients list
    const { data: recipients = [], isLoading } = useQuery({
        queryKey: ['available-recipients', recipientType, audienceSegment],
        queryFn: async () => {
            if (recipientType !== 'audience_segment' || !audienceSegment) {
                return [];
            }

            let query = supabase
                .from('user_profiles')
                .select('id, user_email, first_name, last_name, persona_type')
                .not('user_email', 'is', null)
                .limit(100);

            // Filter by persona type based on segment
            if (audienceSegment === 'municipality_staff') {
                query = query.in('persona_type', ['municipality_staff', 'municipality_admin', 'municipality_coordinator']);
            } else if (audienceSegment === 'partners') {
                query = query.in('persona_type', ['provider', 'partner']);
            } else if (audienceSegment === 'leadership') {
                query = query.in('persona_type', ['deputyship_admin', 'admin']);
            } else if (audienceSegment === 'citizens') {
                // Fetch from citizen_profiles for citizens
                const { data: citizenData, error: citizenError } = await supabase
                    .from('citizen_profiles')
                    .select('id, user_email')
                    .not('user_email', 'is', null)
                    .limit(100);

                if (citizenError) throw citizenError;
                return citizenData || [];
            }

            const { data, error } = await query;
            if (error) {
                console.error('Error fetching recipients:', error);
                return [];
            }
            return data || [];
        },
        enabled: recipientType === 'audience_segment' && !!audienceSegment,
        staleTime: 1000 * 60 * 5
    });

    // Fetch total recipient count
    const { data: recipientCount = 0 } = useQuery({
        queryKey: ['recipient-count', recipientType, audienceSegment],
        queryFn: async () => {
            if (recipientType === 'all') {
                const { count, error } = await supabase
                    .from('user_profiles')
                    .select('id', { count: 'exact', head: true })
                    .not('user_email', 'is', null);
                if (error) throw error;
                return count || 0;
            }
            if (recipientType === 'audience_segment' && audienceSegment) {
                // We rely on the recipients query length for now for segments as we limit to 100 in the list anyway
                // Ideally we'd do a count query here if needed for larger datasets
                return recipients.length;
            }
            return 0;
        },
        enabled: recipientType === 'all' || (recipientType === 'audience_segment' && !!audienceSegment)
    });

    return { recipients, recipientCount, isLoading };
}

