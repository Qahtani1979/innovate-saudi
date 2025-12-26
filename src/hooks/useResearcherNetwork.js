import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';

/**
 * Hook for researcher network connections and collaborations
 */
export function useResearcherConnections(researcherId) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['researcher-connections', researcherId],
        queryFn: async () => {
            let query = supabase
                .from('researcher_connections')
                .select('*')
                .or(`researcher1_id.eq.${researcherId},researcher2_id.eq.${researcherId}`)
                .order('created_at', { ascending: false });

            query = applyVisibilityRules(query, 'researcher_connection');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!researcherId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for researcher collaborations
 */
export function useResearcherCollaborations(researcherId) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['researcher-collaborations', researcherId],
        queryFn: async () => {
            let query = supabase
                .from('researcher_collaborations')
                .select('*')
                .contains('researcher_ids', [researcherId])
                .order('created_at', { ascending: false });

            query = applyVisibilityRules(query, 'researcher_collaboration');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!researcherId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for researcher network mutations
 */
export function useResearcherMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    const createResearcherProfile = useMutation({
        mutationFn: async (data) => {
            const profileData = {
                ...data,
                user_email: user?.email,
                created_at: new Date().toISOString(),
            };

            const { data: profile, error } = await supabase
                .from('researchers')
                .insert(profileData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'researcher', profile.id, null, profileData);

            return profile;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['researchers']);
            toast.success(t({ en: 'Researcher profile created', ar: 'تم إنشاء ملف الباحث' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create profile', ar: 'فشل إنشاء الملف' }));
            console.error('Create researcher profile error:', error);
        },
    });

    const updateResearcherProfile = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentProfile } = await supabase
                .from('researchers')
                .select('*')
                .eq('id', id)
                .single();

            const { data: profile, error } = await supabase
                .from('researchers')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'researcher', id, currentProfile, data);

            return profile;
        },
        onSuccess: (profile) => {
            queryClient.invalidateQueries(['researchers']);
            queryClient.invalidateQueries(['researcher', profile.id]);
            toast.success(t({ en: 'Profile updated', ar: 'تم تحديث الملف' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update profile', ar: 'فشل تحديث الملف' }));
            console.error('Update researcher profile error:', error);
        },
    });

    const connectResearchers = useMutation({
        mutationFn: async ({ researcherId1, researcherId2 }) => {
            const { data, error } = await supabase
                .from('researcher_connections')
                .insert({
                    researcher1_id: researcherId1,
                    researcher2_id: researcherId2,
                    status: 'active',
                    created_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['researcher-connections', variables.researcherId1]);
            queryClient.invalidateQueries(['researcher-connections', variables.researcherId2]);
            toast.success(t({ en: 'Researchers connected', ar: 'تم ربط الباحثين' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to connect researchers', ar: 'فشل ربط الباحثين' }));
            console.error('Connect researchers error:', error);
        },
    });

    return {
        createResearcherProfile,
        updateResearcherProfile,
        connectResearchers,
    };
}

export default useResearcherConnections;

