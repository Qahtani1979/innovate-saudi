import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export function useCitizenStats() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['citizen-stats', user?.id],
        queryFn: async () => {
            const [ideasRes, votesRes, pointsRes] = await Promise.all([
                supabase.from('citizen_ideas').select('id', { count: 'exact', head: true }).eq('user_id', user?.id),
                supabase.from('citizen_votes').select('id', { count: 'exact', head: true }).eq('user_id', user?.id),
                supabase.from('citizen_points').select('*').eq('user_id', user?.id).maybeSingle()
            ]);
            return {
                ideasCount: ideasRes.count || 0,
                votesCount: votesRes.count || 0,
                points: pointsRes.data?.points || 0,
                level: pointsRes.data?.level || 1
            };
        },
        enabled: !!user?.id
    });
}

