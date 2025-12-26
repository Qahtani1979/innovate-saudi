import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

/**
 * Hook for matchmaker application details with gold standard abstraction
 */
export function useMatchmakerApplicationDetails(applicationId) {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    // Fetch application
    const useApplication = () => useQuery({
        queryKey: ['matchmaker-application', applicationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matchmaker_applications')
                .select('*')
                .eq('id', applicationId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!applicationId
    });

    // Fetch matched challenges
    const useMatchedChallenges = (application) => useQuery({
        queryKey: ['matched-challenges', applicationId],
        queryFn: async () => {
            if (!application?.matched_challenges?.length) return [];
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .in('id', application.matched_challenges);

            if (error) throw error;
            return data;
        },
        enabled: !!application
    });

    // Fetch converted pilots
    const useConvertedPilots = (application) => useQuery({
        queryKey: ['converted-pilots', applicationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('solution_id', application.organization_id);

            if (error) throw error;
            return data;
        },
        enabled: !!application
    });

    // Fetch expert evaluations
    const useExpertEvaluations = () => useQuery({
        queryKey: ['matchmaker-expert-evaluations', applicationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', 'matchmaker_application')
                .eq('entity_id', applicationId);

            if (error) throw error;
            return data;
        },
        enabled: !!applicationId
    });

    // Update application mutation
    const updateApplication = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: updated, error } = await supabase
                .from('matchmaker_applications')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['matchmaker-application', applicationId]);
            toast.success(t({ en: 'Updated successfully', ar: 'تم التحديث بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Update failed', ar: 'فشل التحديث' }));
            console.error('Update error:', error);
        }
    });

    // Create evaluation session mutation
    const createEvaluationSession = useMutation({
        mutationFn: async (sessionData) => {
            // Logic moved to client - simply calculate and return data for next step
            return sessionData;
        }
    });

    // Create application mutation
    const createApplication = useMutation({
        mutationFn: async (data) => {
            // Auto-generate application code
            const year = new Date().getFullYear();

            const { count } = await supabase
                .from('matchmaker_applications')
                .select('*', { count: 'exact', head: true })
                .ilike('application_code', `MMA-${year}-%`);

            const nextNum = (count || 0) + 1;
            const application_code = `MMA-${year}-${String(nextNum).padStart(3, '0')}`;

            const { data: newApp, error } = await supabase
                .from('matchmaker_applications')
                .insert({
                    ...data,
                    application_code
                })
                .select()
                .single();

            if (error) throw error;
            return newApp;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['matchmaker-applications']);
            toast.success(t({ en: 'Application submitted successfully', ar: 'تم تقديم الطلب بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Submission failed', ar: 'فشل التقديم' }));
            console.error('Create error:', error);
        }
    });

    // Refresh application data (gold standard pattern)
    const refreshApplication = () => {
        queryClient.invalidateQueries({ queryKey: ['matchmaker-application', applicationId] });
        queryClient.invalidateQueries({ queryKey: ['matched-challenges', applicationId] });
        queryClient.invalidateQueries({ queryKey: ['converted-pilots', applicationId] });
        queryClient.invalidateQueries({ queryKey: ['matchmaker-expert-evaluations', applicationId] });
    };

    return {
        useApplication,
        useMatchedChallenges,
        useConvertedPilots,
        useExpertEvaluations,
        updateApplication,
        createEvaluationSession,
        createApplication,
        refreshApplication
    };
}

export default useMatchmakerApplicationDetails;

